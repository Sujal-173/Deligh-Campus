package com.itsdeligh.platform.trainer;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.itsdeligh.platform.common.api.ApiResponse;
import com.itsdeligh.platform.common.data.PlatformJdbcService;
import com.itsdeligh.platform.common.security.CurrentUserProvider;

import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/trainer")
@PreAuthorize("hasRole('TRAINER')")
public class TrainerController {
    private final PlatformJdbcService db;
    private final CurrentUserProvider currentUser;

    public TrainerController(PlatformJdbcService db, CurrentUserProvider currentUser) {
        this.db = db;
        this.currentUser = currentUser;
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        UUID trainer = currentUser.getCurrentUserId();
        Map<String, Object> u = db.one("SELECT full_name FROM users WHERE id = :id", Map.of("id", trainer));
        long students = db.count("SELECT COUNT(DISTINCT bs.student_id) FROM batches b JOIN batch_students bs ON bs.batch_id = b.id WHERE b.trainer_id = :trainer", Map.of("trainer", trainer));
        long batches = db.count("SELECT COUNT(*) FROM batches WHERE trainer_id = :trainer", Map.of("trainer", trainer));
        long assessments = db.count("SELECT COUNT(*) FROM assessments WHERE trainer_id = :trainer", Map.of("trainer", trainer));
        List<Map<String, Object>> today = schedule(trainer, true);
        List<Map<String, Object>> upcoming = schedule(trainer, false);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("welcomeName", u == null ? "Trainer" : u.get("full_name"));
        data.put("todaySchedule", today);
        data.put("upcomingClasses", upcoming);
        data.put("studentMetrics", List.of(metric("students", "Students", students, "Assigned learner count", 0), metric("batches", "Batches", batches, "Active training batches", 0)));
        data.put("assessmentMetrics", List.of(metric("assessments", "Assessments", assessments, "Created assessments", 0), metric("graded", "Completed Reviews", db.count("SELECT COUNT(*) FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id WHERE a.trainer_id = :trainer AND aa.status = 'completed'", Map.of("trainer", trainer)), "Submitted attempts", 0)));
        data.put("recentActivities", db.list("""
                SELECT al.id, COALESCE(u.full_name,'System') AS actor_name, al.action AS description, al.created_at AS occurred_at
                FROM audit_logs al LEFT JOIN users u ON u.id = al.actor_id
                WHERE al.actor_id = :trainer ORDER BY al.created_at DESC LIMIT 8
                """, Map.of("trainer", trainer)).stream().map(r -> db.params("id", r.get("id"), "actorName", r.get("actor_name"), "description", String.valueOf(r.get("description")), "occurredAt", r.get("occurred_at"))).toList());
        return ApiResponse.success(data);
    }

    @GetMapping("/batches")
    public ApiResponse<Map<String, Object>> batches(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        UUID trainer = currentUser.getCurrentUserId();
        PlatformJdbcService.Page p = db.page("""
                SELECT b.id, b.name, COALESCE(c.title,'') AS course_title, COUNT(bs.student_id) AS student_count,
                       b.start_date, b.end_date, b.status
                FROM batches b LEFT JOIN courses c ON c.id = b.course_id LEFT JOIN batch_students bs ON bs.batch_id = b.id
                WHERE b.trainer_id = :trainer GROUP BY b.id, c.title ORDER BY b.start_date DESC LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM batches WHERE trainer_id = :trainer", Map.of("trainer", trainer), page, size);
        return ApiResponse.success(p.asMap());
    }

    @GetMapping("/batches/{id}")
    public ApiResponse<Map<String, Object>> batch(@PathVariable String id) {
        UUID trainer = currentUser.getCurrentUserId(); UUID batch = db.uuid(id);
        Map<String, Object> b = db.one("""
                SELECT b.id, b.name, b.description, b.start_date, b.end_date,
                       COUNT(bs.student_id) AS total_students,
                       COALESCE(AVG(CASE WHEN bs.attendance_rate IS NOT NULL THEN bs.attendance_rate END),0) AS average_attendance,
                       0::numeric AS average_score
                FROM batches b LEFT JOIN batch_students bs ON bs.batch_id = b.id
                WHERE b.id = :id AND b.trainer_id = :trainer GROUP BY b.id
                """, Map.of("id", batch, "trainer", trainer));
        if (b == null) return ApiResponse.error("Batch not found");
        List<Map<String,Object>> students = db.list("""
                SELECT u.id, u.full_name AS name, bs.enrollment_date, COALESCE(bs.attendance_rate,0) AS attendance_rate
                FROM batch_students bs JOIN users u ON u.id = bs.student_id WHERE bs.batch_id = :batch ORDER BY u.full_name
                """, Map.of("batch", batch)).stream().map(r -> db.params("id", r.get("id"), "name", r.get("name"), "enrollmentDate", r.get("enrollment_date"), "attendanceRate", r.get("attendance_rate"))).toList();
        Map<String,Object> out = new LinkedHashMap<>();
        out.put("id", b.get("id")); out.put("name", b.get("name")); out.put("description", b.get("description")); out.put("students", students);
        out.put("totalStudents", b.get("total_students")); out.put("averageAttendance", b.get("average_attendance")); out.put("averageScore", b.get("average_score"));
        out.put("scheduleDays", List.of("Monday", "Wednesday", "Friday")); out.put("scheduleStartTime", "18:00"); out.put("scheduleEndTime", "19:00");
        return ApiResponse.success(out);
    }

    @PostMapping("/batches")
    public ApiResponse<Map<String, Object>> createBatch(@RequestBody Map<String,Object> body) {
        UUID trainer = currentUser.getCurrentUserId(); UUID id = UUID.randomUUID();
        db.update("INSERT INTO batches (id,name,course_id,trainer_id,description,start_date,end_date,status) VALUES (:id,:name,:course,:trainer,:description,:start,:end,:status)", db.params(
                "id", id, "name", String.valueOf(body.getOrDefault("name","New Batch")), "course", body.get("courseId") == null ? null : db.uuid(String.valueOf(body.get("courseId"))),
                "trainer", trainer, "description", body.getOrDefault("description", ""), "start", parseDate(body.get("startDate")), "end", parseDate(body.get("endDate")), "status", body.getOrDefault("status","active")));
        db.touchAudit(trainer, "BATCH_CREATED", "batch", id.toString(), String.valueOf(body.getOrDefault("name","New Batch")));
        return ApiResponse.success(batchSummary(id));
    }

    @PutMapping("/batches/{id}")
    public ApiResponse<Map<String,Object>> updateBatch(@PathVariable String id, @RequestBody Map<String,Object> body) {
        UUID trainer = currentUser.getCurrentUserId(); UUID batch = db.uuid(id);
        db.update("UPDATE batches SET name=COALESCE(:name,name), description=COALESCE(:description,description), start_date=COALESCE(:start,start_date), end_date=COALESCE(:end,end_date), status=COALESCE(:status,status), updated_at=NOW() WHERE id=:id AND trainer_id=:trainer", db.params("id", batch, "trainer", trainer, "name", body.get("name"), "description", body.get("description"), "start", parseDate(body.get("startDate")), "end", parseDate(body.get("endDate")), "status", body.get("status")));
        return ApiResponse.success(batchSummary(batch));
    }

    @GetMapping("/courses")
    public ApiResponse<Map<String,Object>> courses(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID trainer = currentUser.getCurrentUserId();
        PlatformJdbcService.Page p = db.page("""
                SELECT c.id,c.title,COUNT(DISTINCT e.student_id) AS student_count,COUNT(DISTINCT b.id) AS batch_count,c.status
                FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id LEFT JOIN batches b ON b.course_id=c.id AND b.trainer_id=:trainer
                WHERE c.trainer_id=:trainer OR EXISTS (SELECT 1 FROM batches bx WHERE bx.course_id=c.id AND bx.trainer_id=:trainer)
                GROUP BY c.id ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM courses WHERE trainer_id=:trainer OR id IN (SELECT course_id FROM batches WHERE trainer_id=:trainer)", Map.of("trainer", trainer), page, size);
        List<Map<String,Object>> items = p.items().stream().map(r -> db.params("id",r.get("id"),"title",r.get("title"),"studentCount",r.get("student_count"),"batchCount",r.get("batch_count"),"status",r.get("status"))).toList();
        return ApiResponse.success(new PlatformJdbcService.Page(items,p.page(),p.size(),p.totalItems(),p.totalPages()).asMap());
    }

    @PostMapping("/courses")
    public ApiResponse<Map<String,Object>> createCourse(@RequestBody Map<String,Object> body) {
        UUID trainer=currentUser.getCurrentUserId(); UUID id=UUID.randomUUID();
        db.update("INSERT INTO courses (id,title,category,level,description,status,trainer_id,learning_outcomes) VALUES (:id,:title,:category,:level,:description,'draft',:trainer,'[]'::jsonb)", Map.of("id",id,"title",body.getOrDefault("title","Untitled Course"),"category",body.getOrDefault("category","Soft Skills"),"level",body.getOrDefault("level","Beginner to Advanced"),"description",body.getOrDefault("description",""),"trainer",trainer));
        db.touchAudit(trainer,"COURSE_CREATED","course",id.toString(),String.valueOf(body.getOrDefault("title","")));
        return ApiResponse.success(courseSummary(id));
    }

    @GetMapping("/courses/{id}")
    public ApiResponse<Map<String,Object>> course(@PathVariable String id) {
        UUID trainer = currentUser.getCurrentUserId();
        UUID course = db.uuid(id);
        Map<String,Object> row = db.one("SELECT c.id,c.title,c.category,c.level,c.description,c.status,c.approval_status,COALESCE(c.learning_outcomes::text,'[]') learning_outcomes FROM courses c WHERE c.id=:id AND (c.trainer_id=:trainer OR EXISTS (SELECT 1 FROM batches b WHERE b.course_id=c.id AND b.trainer_id=:trainer))", Map.of("id",course,"trainer",trainer));
        return row == null ? ApiResponse.error("Course not found") : ApiResponse.success(db.params("id",row.get("id"),"title",row.get("title"),"category",row.get("category"),"level",row.get("level"),"description",row.get("description"),"status",row.get("status"),"approvalStatus",row.get("approval_status"),"learningOutcomes",row.get("learning_outcomes")));
    }

    @PutMapping("/courses/{id}")
    public ApiResponse<Map<String,Object>> updateCourse(@PathVariable String id,@RequestBody Map<String,Object> body){
        UUID trainer=currentUser.getCurrentUserId(); UUID course=db.uuid(id);
        db.update("UPDATE courses SET title=COALESCE(:title,title),category=COALESCE(:category,category),level=COALESCE(:level,level),description=COALESCE(:description,description),approval_status=COALESCE(:approvalStatus,approval_status),updated_at=NOW() WHERE id=:id AND trainer_id=:trainer",db.params("id",course,"trainer",trainer,"title",body.get("title"),"category",body.get("category"),"level",body.get("level"),"description",body.get("description"),"approvalStatus",body.get("approvalStatus")));
        return ApiResponse.success(courseSummary(course));
    }

    @GetMapping("/live-classes")
    public ApiResponse<Map<String,Object>> liveClasses(){
        UUID trainer=currentUser.getCurrentUserId();
        List<Map<String,Object>> rows=db.list("""
                SELECT s.id,s.title,b.name AS batch_name,s.starts_at,s.duration_minutes,s.status,s.room_url,
                       COALESCE((SELECT COUNT(*) FROM attendance a WHERE a.session_id=s.id AND a.joined=TRUE),0) AS joined_student_count
                FROM sessions s JOIN batches b ON b.id=s.batch_id WHERE s.trainer_id=:trainer AND s.starts_at>=NOW()-INTERVAL '1 day' ORDER BY s.starts_at LIMIT 20
                """,Map.of("trainer",trainer));
        Map<String,Object> current=null; List<Map<String,Object>> upcoming=new ArrayList<>();
        for(Map<String,Object> r:rows){ Map<String,Object> x=new LinkedHashMap<>(); x.put("id",r.get("id"));x.put("title",r.get("title"));x.put("batchName",r.get("batch_name"));x.put("startsAt",r.get("starts_at"));x.put("status",r.get("status"));x.put("joinedStudentCount",r.get("joined_student_count"));x.put("roomUrl",r.get("room_url")); if("live".equals(String.valueOf(r.get("status")))) current=x; else upcoming.add(x); }
        List<Map<String,Object>> recordings=db.list("SELECT id,title,recorded_at,duration_minutes,playback_url FROM session_recordings WHERE trainer_id=:trainer ORDER BY recorded_at DESC LIMIT 20",Map.of("trainer",trainer)).stream().map(r->db.params("id",r.get("id"),"title",r.get("title"),"recordedAt",r.get("recorded_at"),"durationMinutes",r.get("duration_minutes"),"playbackUrl",r.get("playback_url"))).toList();
        Map<String,Object> data=new LinkedHashMap<>(); data.put("currentClass",current);data.put("upcomingSchedule",upcoming);data.put("recordings",recordings);data.put("reportMetrics",List.of(metric("classes","Classes",db.count("SELECT COUNT(*) FROM sessions WHERE trainer_id=:trainer",Map.of("trainer",trainer)),"Total sessions",0))); return ApiResponse.success(data);
    }

    @GetMapping("/students")
    public ApiResponse<Map<String,Object>> students(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        UUID trainer=currentUser.getCurrentUserId(); PlatformJdbcService.Page p=db.page("""
                SELECT DISTINCT u.id,u.full_name AS name,b.id AS batch_id,b.name AS batch_name,u.email,COALESCE(AVG(bs.attendance_rate),0) AS attendance_rate
                FROM batch_students bs JOIN batches b ON b.id=bs.batch_id JOIN users u ON u.id=bs.student_id WHERE b.trainer_id=:trainer GROUP BY u.id,u.full_name,b.name,u.email ORDER BY u.full_name LIMIT :limit OFFSET :offset
                ""","SELECT COUNT(DISTINCT bs.student_id) FROM batch_students bs JOIN batches b ON b.id=bs.batch_id WHERE b.trainer_id=:trainer",Map.of("trainer",trainer),page,size);
        List<Map<String,Object>> items=p.items().stream().map(r->db.params("id",r.get("id"),"name",r.get("name"),"batchId",r.get("batch_id"),"email",r.get("email"),"batchName",r.get("batch_name"),"profileUrl","/trainer/students/"+r.get("id"))).toList();
        Map<String,Object> data=new LinkedHashMap<>();data.put("students",items);data.put("batches",db.list("SELECT id,name FROM batches WHERE trainer_id=:trainer ORDER BY name",Map.of("trainer",trainer)));data.put("metrics",List.of(metric("students","Students",p.totalItems(),"Assigned learners",0)));return ApiResponse.success(data);
    }

    @GetMapping("/students/{id}") public ApiResponse<Map<String,Object>> student(@PathVariable String id){
        UUID trainer=currentUser.getCurrentUserId(),student=db.uuid(id); Map<String,Object> row=db.one("SELECT u.id,u.full_name AS name,u.email,u.mobile,COALESCE(AVG(bs.attendance_rate),0) AS attendance_rate,COUNT(DISTINCT bs.batch_id) AS batch_count FROM users u JOIN batch_students bs ON bs.student_id=u.id JOIN batches b ON b.id=bs.batch_id WHERE u.id=:student AND b.trainer_id=:trainer GROUP BY u.id",Map.of("student",student,"trainer",trainer)); if(row==null)return ApiResponse.error("Student not found"); return ApiResponse.success(row);
    }

    @GetMapping("/assessments") public ApiResponse<Map<String,Object>> assessments(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){
        UUID trainer=currentUser.getCurrentUserId(); PlatformJdbcService.Page p=db.page("SELECT a.id,a.title,a.type,b.name AS batch_name,a.due_at,a.status,a.duration_minutes FROM assessments a LEFT JOIN batches b ON b.id=a.batch_id WHERE a.trainer_id=:trainer ORDER BY a.due_at NULLS LAST LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM assessments WHERE trainer_id=:trainer",Map.of("trainer",trainer),page,size); List<Map<String,Object>> items=p.items().stream().map(r->db.params("id",r.get("id"),"title",r.get("title"),"type",r.get("type"),"batchName",r.get("batch_name"),"dueAt",r.get("due_at"),"status",r.get("status"),"durationMinutes",r.get("duration_minutes"))).toList(); Map<String,Object> data=new LinkedHashMap<>();data.put("metrics",List.of(metric("assessments","Assessments",p.totalItems(),"Created assessments",0)));data.put("assessments",items);data.put("types",List.of("Quiz","Assignment","Viva","Project"));return ApiResponse.success(data);
    }

    @PostMapping("/assessments") public ApiResponse<Map<String,Object>> createAssessment(@RequestBody Map<String,Object> body){ UUID trainer=currentUser.getCurrentUserId(),id=UUID.randomUUID(); db.update("INSERT INTO assessments (id,title,type,batch_id,trainer_id,due_at,status,duration_minutes,question_count,description) VALUES (:id,:title,:type,:batch,:trainer,:due,'draft',:duration,:count,:description)",db.params("id",id,"title",body.getOrDefault("title","New Assessment"),"type",body.getOrDefault("type","Quiz"),"batch",body.get("batchId")==null?null:db.uuid(String.valueOf(body.get("batchId"))),"trainer",trainer,"due",parseDateTime(body.get("dueAt")),"duration",body.getOrDefault("durationMinutes",30),"count",body.getOrDefault("questionCount",10),"description",body.getOrDefault("description","")));db.touchAudit(trainer,"ASSESSMENT_CREATED","assessment",id.toString(),String.valueOf(body.getOrDefault("title","")));return ApiResponse.success(assessmentSummary(id)); }
    @GetMapping("/assessments/{id}") public ApiResponse<Map<String,Object>> assessment(@PathVariable String id){
        UUID trainer=currentUser.getCurrentUserId(),assessment=db.uuid(id);
        Map<String,Object> row=db.one("SELECT a.id,a.title,a.type,a.status,a.due_at,a.duration_minutes,a.question_count,a.description,COALESCE(b.name,'') batch_name FROM assessments a LEFT JOIN batches b ON b.id=a.batch_id WHERE a.id=:assessment AND a.trainer_id=:trainer",Map.of("assessment",assessment,"trainer",trainer));
        if(row==null)return ApiResponse.error("Assessment not found");
        List<Map<String,Object>> attempts=db.list("SELECT aa.id,aa.student_id,u.full_name student_name,u.email,aa.status,aa.score,aa.started_at,aa.completed_at,(SELECT COUNT(*) FROM assessment_answers ans WHERE ans.attempt_id=aa.id) answer_count FROM assessment_attempts aa JOIN users u ON u.id=aa.student_id WHERE aa.assessment_id=:assessment ORDER BY aa.started_at DESC",Map.of("assessment",assessment));
        Map<String,Object> out=new LinkedHashMap<>(row);out.put("attempts",attempts);out.put("attemptCount",attempts.size());return ApiResponse.success(out);
    }
    @PutMapping("/assessments/{id}") public ApiResponse<Map<String,Object>> updateAssessment(@PathVariable String id,@RequestBody Map<String,Object> body){ UUID trainer=currentUser.getCurrentUserId(),a=db.uuid(id); db.update("UPDATE assessments SET title=COALESCE(:title,title),type=COALESCE(:type,type),batch_id=COALESCE(:batch,batch_id),due_at=COALESCE(:due,due_at),status=COALESCE(:status,status),duration_minutes=COALESCE(:duration,duration_minutes),question_count=COALESCE(:count,question_count) WHERE id=:id AND trainer_id=:trainer",db.params("id",a,"trainer",trainer,"title",body.get("title"),"type",body.get("type"),"batch",body.get("batchId")==null?null:db.uuid(String.valueOf(body.get("batchId"))),"due",parseDateTime(body.get("dueAt")),"status",body.get("status"),"duration",body.get("durationMinutes"),"count",body.get("questionCount")));return ApiResponse.success(assessmentSummary(a)); }
    @PatchMapping("/assessments/{id}/attempts/{attemptId}") public ApiResponse<Map<String,Object>> gradeAttempt(@PathVariable String id,@PathVariable String attemptId,@RequestBody Map<String,Object> body){
        UUID trainer=currentUser.getCurrentUserId(),assessment=db.uuid(id),attempt=db.uuid(attemptId);
        Object scoreRaw=body.get("score"); if(scoreRaw==null)return ApiResponse.error("Score is required");
        double score; try{score=Double.parseDouble(String.valueOf(scoreRaw));}catch(Exception ex){return ApiResponse.error("Score must be numeric");} if(score<0||score>100)return ApiResponse.error("Score must be between 0 and 100");
        int updated=db.update("UPDATE assessment_attempts aa SET score=:score,status='completed',completed_at=COALESCE(completed_at,NOW()) WHERE aa.id=:attempt AND aa.assessment_id=:assessment AND EXISTS (SELECT 1 FROM assessments a WHERE a.id=aa.assessment_id AND a.trainer_id=:trainer)",Map.of("score",score,"attempt",attempt,"assessment",assessment,"trainer",trainer));
        if(updated==0)return ApiResponse.error("Assessment attempt not found"); db.touchAudit(trainer,"ASSESSMENT_GRADED","assessment",id,"Attempt "+attemptId+" scored "+score); return ApiResponse.success(Map.of("attemptId",attempt,"score",score,"status","completed"));
    }

    @PostMapping("/sessions") public ApiResponse<Map<String,Object>> createSession(@RequestBody Map<String,Object> body){ UUID trainer=currentUser.getCurrentUserId(),id=UUID.randomUUID(); db.update("INSERT INTO sessions(id,title,batch_id,trainer_id,starts_at,duration_minutes,status,room_url) VALUES(:id,:title,:batch,:trainer,:starts,:duration,:status,:roomUrl)",db.params("id",id,"title",body.getOrDefault("title","Live Class"),"batch",db.uuid(String.valueOf(body.get("batchId"))),"trainer",trainer,"starts",parseDateTime(body.get("startsAt")),"duration",body.getOrDefault("durationMinutes",60),"status",body.getOrDefault("status","scheduled"),"roomUrl",body.get("roomUrl"))); db.touchAudit(trainer,"SESSION_CREATED","session",id.toString(),String.valueOf(body.getOrDefault("title",""))); return ApiResponse.success(db.one("SELECT s.id,s.title,b.name batch_name,s.starts_at,s.duration_minutes,s.status,s.room_url FROM sessions s JOIN batches b ON b.id=s.batch_id WHERE s.id=:id",Map.of("id",id))); }
    @PutMapping("/sessions/{id}") public ApiResponse<Map<String,Object>> updateSession(@PathVariable String id,@RequestBody Map<String,Object> body){ UUID trainer=currentUser.getCurrentUserId(),session=db.uuid(id); db.update("UPDATE sessions SET title=COALESCE(:title,title),starts_at=COALESCE(:starts,starts_at),duration_minutes=COALESCE(:duration,duration_minutes),status=COALESCE(:status,status),room_url=COALESCE(:roomUrl,room_url),updated_at=NOW() WHERE id=:id AND trainer_id=:trainer",db.params("id",session,"trainer",trainer,"title",body.get("title"),"starts",parseDateTime(body.get("startsAt")),"duration",body.get("durationMinutes"),"status",body.get("status"),"roomUrl",body.get("roomUrl"))); return ApiResponse.success(db.one("SELECT s.id,s.title,b.name batch_name,s.starts_at,s.duration_minutes,s.status,s.room_url FROM sessions s JOIN batches b ON b.id=s.batch_id WHERE s.id=:id",Map.of("id",session))); }

    @GetMapping("/reports") public ApiResponse<Map<String,Object>> reports(){return ApiResponse.success(Map.of("reports",List.of(Map.of("id","attendance","title","Attendance Report","description","Batch attendance summary","type","attendance"),Map.of("id","assessment","title","Assessment Report","description","Submission and grading metrics","type","assessment")),"batches",db.list("SELECT id,name FROM batches WHERE trainer_id=:trainer ORDER BY name",Map.of("trainer",currentUser.getCurrentUserId()))));}
    @GetMapping("/reports/{type}") public ApiResponse<Map<String,Object>> report(@PathVariable String type,@RequestParam(required=false) String batchId){
        UUID trainer=currentUser.getCurrentUserId(); UUID batch=batchId==null||batchId.isBlank()?null:db.uuid(batchId);
        if(batch!=null && db.one("SELECT id FROM batches WHERE id=:batch AND trainer_id=:trainer",Map.of("batch",batch,"trainer",trainer))==null)return ApiResponse.error("Batch not found");
        Map<String,Object> out=new LinkedHashMap<>(); out.put("type",type); out.put("title", "attendance".equalsIgnoreCase(type)?"Attendance Report":"Assessment Report"); if(batch!=null)out.put("batchId",batch);
        if("attendance".equalsIgnoreCase(type)){
            Map<String,Object> summary=db.one("SELECT COUNT(DISTINCT bs.student_id) AS students,COUNT(DISTINCT s.id) AS sessions,COUNT(a.id) FILTER (WHERE a.joined=TRUE) AS present,COUNT(a.id) AS marked FROM batch_students bs JOIN batches b ON b.id=bs.batch_id LEFT JOIN sessions s ON s.batch_id=b.id LEFT JOIN attendance a ON a.session_id=s.id AND a.student_id=bs.student_id WHERE b.trainer_id=:trainer AND (:batch IS NULL OR b.id=:batch)",db.params("trainer",trainer,"batch",batch));
            out.put("students",summary==null?0:summary.get("students"));out.put("sessions",summary==null?0:summary.get("sessions"));out.put("present",summary==null?0:summary.get("present"));out.put("marked",summary==null?0:summary.get("marked"));
            double rate=summary==null||summary.get("marked")==null||((Number)summary.get("marked")).longValue()==0?0:((Number)summary.get("present")).doubleValue()*100.0/((Number)summary.get("marked")).doubleValue(); out.put("attendanceRate",Math.round(rate*100.0)/100.0);
            out.put("batchBreakdown",db.list("SELECT b.id,b.name,COUNT(DISTINCT bs.student_id) students,COALESCE(AVG(bs.attendance_rate),0) attendance_rate FROM batches b LEFT JOIN batch_students bs ON bs.batch_id=b.id WHERE b.trainer_id=:trainer AND (:batch IS NULL OR b.id=:batch) GROUP BY b.id,b.name ORDER BY b.name",db.params("trainer",trainer,"batch",batch)));
        }else if("assessment".equalsIgnoreCase(type)){
            Map<String,Object> summary=db.one("SELECT COUNT(DISTINCT a.id) AS assessments,COUNT(aa.id) AS attempts,COUNT(aa.id) FILTER (WHERE aa.status='completed') AS completed,COALESCE(AVG(aa.score),0) AS average_score FROM assessments a LEFT JOIN assessment_attempts aa ON aa.assessment_id=a.id LEFT JOIN batches b ON b.id=a.batch_id WHERE a.trainer_id=:trainer AND (:batch IS NULL OR b.id=:batch)",db.params("trainer",trainer,"batch",batch));
            out.put("assessments",summary==null?0:summary.get("assessments"));out.put("attempts",summary==null?0:summary.get("attempts"));out.put("completed",summary==null?0:summary.get("completed"));out.put("averageScore",summary==null?0:summary.get("average_score"));
            out.put("batchBreakdown",db.list("SELECT b.id,b.name,COUNT(DISTINCT a.id) assessments,COUNT(aa.id) attempts,COUNT(aa.id) FILTER (WHERE aa.status='completed') completed,COALESCE(AVG(aa.score),0) average_score FROM batches b LEFT JOIN assessments a ON a.batch_id=b.id AND a.trainer_id=:trainer LEFT JOIN assessment_attempts aa ON aa.assessment_id=a.id WHERE b.trainer_id=:trainer AND (:batch IS NULL OR b.id=:batch) GROUP BY b.id,b.name ORDER BY b.name",db.params("trainer",trainer,"batch",batch)));
        }else{return ApiResponse.error("Unknown report type");}
        out.put("generatedAt",OffsetDateTime.now()); return ApiResponse.success(out);
    }
    @PostMapping(value="/reports/export", produces=MediaType.TEXT_PLAIN_VALUE) public String exportReport(@RequestBody Map<String,Object> body){UUID trainer=currentUser.getCurrentUserId();return "report,generatedAt\nTrainer report,"+OffsetDateTime.now()+"\nTrainer,"+trainer;}
    @PostMapping("/announcements") public ApiResponse<Map<String,Object>> announcement(@RequestBody Map<String,Object> body){UUID trainer=currentUser.getCurrentUserId();UUID id=UUID.randomUUID();db.update("INSERT INTO announcements (id,trainer_id,title,body) VALUES (:id,:trainer,:title,:body)",Map.of("id",id,"trainer",trainer,"title",body.getOrDefault("title","Announcement"),"body",body.getOrDefault("body","")));db.touchAudit(trainer,"ANNOUNCEMENT_CREATED","announcement",id.toString(),String.valueOf(body.getOrDefault("title","")));return ApiResponse.success(Map.of("id",id,"created",true));}
    @PostMapping("/attendance") public ApiResponse<Map<String,Object>> attendance(@RequestBody Map<String,Object> body){UUID trainer=currentUser.getCurrentUserId();UUID session=db.uuid(String.valueOf(body.get("sessionId")));UUID student=db.uuid(String.valueOf(body.get("studentId")));boolean joined=Boolean.parseBoolean(String.valueOf(body.getOrDefault("present",true)));db.update("INSERT INTO attendance (id,session_id,student_id,joined,marked_by) VALUES (:id,:session,:student,:joined,:trainer) ON CONFLICT(session_id,student_id) DO UPDATE SET joined=:joined,marked_by=:trainer",Map.of("id",UUID.randomUUID(),"session",session,"student",student,"joined",joined,"trainer",trainer));return ApiResponse.success(Map.of("updated",true));}
    @GetMapping("/sessions") public ApiResponse<Map<String,Object>> sessions(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){UUID trainer=currentUser.getCurrentUserId();PlatformJdbcService.Page p=db.page("SELECT s.id,s.title,b.id AS batch_id,b.name AS batch_name,s.starts_at,s.duration_minutes,s.status FROM sessions s JOIN batches b ON b.id=s.batch_id WHERE s.trainer_id=:trainer ORDER BY s.starts_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM sessions WHERE trainer_id=:trainer",Map.of("trainer",trainer),page,size);return ApiResponse.success(p.asMap());}
    @GetMapping("/learners") public ApiResponse<Map<String,Object>> learners(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return students(page,size);}
    @GetMapping("/learners/{id}") public ApiResponse<Map<String,Object>> learner(@PathVariable String id){return student(id);}
    @GetMapping("/feedback") public ApiResponse<List<Map<String,Object>>> feedback(){UUID trainer=currentUser.getCurrentUserId();return ApiResponse.success(db.list("SELECT id,student_id,title,body,rating,status,created_at FROM trainer_feedback WHERE trainer_id=:trainer ORDER BY created_at DESC",Map.of("trainer",trainer)));}
    @PostMapping("/feedback") public ApiResponse<Map<String,Object>> createFeedback(@RequestBody Map<String,Object> body){UUID trainer=currentUser.getCurrentUserId(),id=UUID.randomUUID();db.update("INSERT INTO trainer_feedback (id,trainer_id,student_id,title,body,rating,status) VALUES (:id,:trainer,:student,:title,:body,:rating,'submitted')",Map.of("id",id,"trainer",trainer,"student",db.uuid(String.valueOf(body.get("studentId"))),"title",body.getOrDefault("title","Feedback"),"body",body.getOrDefault("body",""),"rating",body.getOrDefault("rating",0)));return ApiResponse.success(Map.of("id",id,"status","submitted"));}
    @GetMapping("/profile") public ApiResponse<Map<String,Object>> profile(){UUID id=currentUser.getCurrentUserId();Map<String,Object> row=db.one("SELECT full_name,email,mobile,COALESCE(role_title,'Trainer') role_title,COALESCE(about,'') about,gender,avatar_url FROM users WHERE id=:id",Map.of("id",id));if(row==null)return ApiResponse.error("Profile not found");return ApiResponse.success(db.params("fullName",row.get("full_name"),"email",row.get("email"),"mobile",row.get("mobile"),"roleTitle",row.get("role_title"),"about",row.get("about"),"gender",row.get("gender"),"avatarUrl",row.get("avatar_url")));}
    @PutMapping("/profile") public ApiResponse<Map<String,Object>> updateProfile(@RequestBody Map<String,Object> body){UUID id=currentUser.getCurrentUserId();db.update("UPDATE users SET full_name=COALESCE(:name,full_name),mobile=COALESCE(:mobile,mobile),role_title=COALESCE(:roleTitle,role_title),about=COALESCE(:about,about),gender=COALESCE(:gender,gender),avatar_url=COALESCE(:avatarUrl,avatar_url),updated_at=NOW() WHERE id=:id",db.params("id",id,"name",body.get("fullName"),"mobile",body.get("mobile"),"roleTitle",body.get("roleTitle"),"about",body.get("about"),"gender",body.get("gender"),"avatarUrl",body.get("avatarUrl")));return profile();}
    @GetMapping("/notifications") public ApiResponse<List<Map<String,Object>>> notifications(){return ApiResponse.success(db.list("SELECT id,title,body,created_at,read_flag AS read FROM notifications WHERE user_id=:id ORDER BY created_at DESC",Map.of("id",currentUser.getCurrentUserId())));}

    private List<Map<String,Object>> schedule(UUID trainer,boolean today){return db.list("SELECT s.id,s.title,b.name AS batch_name,s.starts_at,s.status FROM sessions s JOIN batches b ON b.id=s.batch_id WHERE s.trainer_id=:trainer AND s.starts_at BETWEEN "+(today?"CURRENT_DATE":"CURRENT_TIMESTAMP")+" AND "+(today?"CURRENT_DATE + INTERVAL '1 day'":"CURRENT_TIMESTAMP + INTERVAL '14 day'")+" ORDER BY s.starts_at LIMIT 10",Map.of("trainer",trainer)).stream().map(r->db.params("id",r.get("id"),"title",r.get("title"),"batchName",r.get("batch_name"),"startsAt",r.get("starts_at"),"status",r.get("status"))).toList();}
    private Map<String,Object> metric(String id,String label,Object value,String helper,double trend){return Map.of("id",id,"label",label,"value",value,"helperText",helper,"trend",trend);}
    private LocalDate parseDate(Object v){return v==null||String.valueOf(v).isBlank()?null:LocalDate.parse(String.valueOf(v));}
    private OffsetDateTime parseDateTime(Object v){if(v==null||String.valueOf(v).isBlank())return null;String value=String.valueOf(v);try{return OffsetDateTime.parse(value);}catch(DateTimeParseException ex){return LocalDateTime.parse(value).atZone(ZoneId.systemDefault()).toOffsetDateTime();}}
    private Map<String,Object> batchSummary(UUID id){Map<String,Object> r=db.one("SELECT b.id,b.name,COALESCE(c.title,'') course_title,b.status,b.start_date,b.end_date,(SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id=b.id) student_count FROM batches b LEFT JOIN courses c ON c.id=b.course_id WHERE b.id=:id",Map.of("id",id));return db.params("id",r.get("id"),"name",r.get("name"),"courseTitle",r.get("course_title"),"status",r.get("status"),"startDate",r.get("start_date"),"endDate",r.get("end_date"),"studentCount",r.get("student_count"));}
    private Map<String,Object> courseSummary(UUID id){Map<String,Object> r=db.one("SELECT c.id,c.title,c.status,c.approval_status,(SELECT COUNT(*) FROM enrollments e WHERE e.course_id=c.id) student_count,(SELECT COUNT(*) FROM batches b WHERE b.course_id=c.id AND b.trainer_id=c.trainer_id) batch_count FROM courses c WHERE c.id=:id",Map.of("id",id));return db.params("id",r.get("id"),"title",r.get("title"),"status",r.get("status"),"approvalStatus",r.get("approval_status"),"studentCount",r.get("student_count"),"batchCount",r.get("batch_count"));}
    private Map<String,Object> assessmentSummary(UUID id){Map<String,Object> r=db.one("SELECT a.id,a.title,a.type,a.status,a.due_at,a.duration_minutes,COALESCE(b.name,'') batch_name FROM assessments a LEFT JOIN batches b ON b.id=a.batch_id WHERE a.id=:id",Map.of("id",id));return db.params("id",r.get("id"),"title",r.get("title"),"type",r.get("type"),"status",r.get("status"),"dueAt",r.get("due_at"),"durationMinutes",r.get("duration_minutes"),"batchName",r.get("batch_name"));}
}

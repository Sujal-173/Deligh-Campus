package com.itsdeligh.platform.recruiter;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.itsdeligh.platform.common.api.ApiResponse;
import com.itsdeligh.platform.common.data.PlatformJdbcService;
import com.itsdeligh.platform.common.security.CurrentUserProvider;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recruiter")
@PreAuthorize("hasRole('RECRUITER')")
public class RecruiterController {
    private static final List<String> PIPELINE_STAGES = List.of("applied", "screening", "interview", "offered", "hired", "rejected");

    private final PlatformJdbcService db;
    private final CurrentUserProvider currentUser;

    public RecruiterController(PlatformJdbcService db, CurrentUserProvider currentUser) {
        this.db = db;
        this.currentUser = currentUser;
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        UUID recruiterId = currentUser.getCurrentUserId();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("metrics", List.of(
                metric("jobs", "Jobs", db.count("SELECT COUNT(*) FROM job_openings WHERE recruiter_id=:id", Map.of("id", recruiterId)), "All openings created by this recruiter"),
                metric("activeJobs", "Active jobs", db.count("SELECT COUNT(*) FROM job_openings WHERE recruiter_id=:id AND status='open'", Map.of("id", recruiterId)), "Currently open roles"),
                metric("applications", "Applications", db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id", Map.of("id", recruiterId)), "Candidate applications"),
                metric("shortlisted", "Shortlisted", db.count("SELECT COUNT(*) FROM recruiter_shortlists WHERE recruiter_id=:id", Map.of("id", recruiterId)), "Saved candidate profiles"),
                metric("hired", "Hired", db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id AND a.status='hired'", Map.of("id", recruiterId)), "Employment outcomes"),
                metric("verifiedCandidates", "Verified talent", db.count("""
                        SELECT COUNT(DISTINCT s.id) FROM users s
                        JOIN user_roles ur ON ur.user_id=s.id JOIN roles r ON r.id=ur.role_id AND r.code='STUDENT'
                        JOIN assessment_attempts a ON a.student_id=s.id AND a.status='completed'
                        """, Map.of()), "Students with completed assessments")
        ));
        data.put("recentCandidates", db.list("""
                SELECT s.id, s.full_name, COALESCE(o.name,'Independent') AS organization_name,
                       ROUND(COALESCE(AVG(a.score),0),1) AS readiness_score,
                       COALESCE(ROUND(AVG(e.progress_percent),1),0) AS progress_percent,
                       ROUND(COALESCE(MAX(a.score),0),1) AS assessment_score,
                       CASE WHEN COUNT(a.id) > 0 THEN 'verified' ELSE 'unverified' END AS verified_status
                FROM users s
                JOIN user_roles ur ON ur.user_id=s.id JOIN roles r ON r.id=ur.role_id AND r.code='STUDENT'
                LEFT JOIN organizations o ON o.id=s.organization_id
                LEFT JOIN assessment_attempts a ON a.student_id=s.id AND a.status='completed'
                LEFT JOIN enrollments e ON e.student_id=s.id
                GROUP BY s.id,s.full_name,o.name
                HAVING COUNT(a.id) > 0
                ORDER BY readiness_score DESC, progress_percent DESC, s.full_name
                LIMIT 8
                """, Map.of()));
        data.put("pipeline", db.list("""
                SELECT a.status AS stage, COUNT(*) AS count
                FROM job_applications a JOIN job_openings j ON j.id=a.job_id
                WHERE j.recruiter_id=:id GROUP BY a.status ORDER BY a.status
                """, Map.of("id", recruiterId)));
        data.put("recentJobs", db.list("""
                SELECT j.id,j.title,j.openings,j.status,j.created_at,j.updated_at,COUNT(a.id) AS application_count
                FROM job_openings j LEFT JOIN job_applications a ON a.job_id=j.id
                WHERE j.recruiter_id=:id GROUP BY j.id,j.title,j.openings,j.status,j.created_at,j.updated_at
                ORDER BY j.created_at DESC LIMIT 8
                """, Map.of("id", recruiterId)));
        return ApiResponse.success("Recruiter dashboard fetched", data);
    }

    @GetMapping("/talent")
    public ApiResponse<Map<String, Object>> talent(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, @RequestParam(required=false) String search) {
        String normalized = search == null || search.isBlank() ? "" : search.trim();
        return ApiResponse.success(db.page("""
                SELECT s.id, s.full_name, COALESCE(o.name,'Independent') AS organization_name,
                       ROUND(COALESCE(AVG(a.score),0),1) AS readiness_score,
                       COALESCE(ROUND(AVG(e.progress_percent),1),0) AS progress_percent,
                       ROUND(COALESCE(MAX(a.score),0),1) AS assessment_score,
                       CASE WHEN COUNT(a.id) > 0 THEN 'verified' ELSE 'unverified' END AS verified_status
                FROM users s
                JOIN user_roles ur ON ur.user_id=s.id JOIN roles r ON r.id=ur.role_id AND r.code='STUDENT'
                LEFT JOIN organizations o ON o.id=s.organization_id
                LEFT JOIN assessment_attempts a ON a.student_id=s.id AND a.status='completed'
                LEFT JOIN enrollments e ON e.student_id=s.id
                WHERE (:search = '' OR LOWER(s.full_name) LIKE LOWER('%' || :search || '%') OR LOWER(COALESCE(o.name,'')) LIKE LOWER('%' || :search || '%'))
                GROUP BY s.id,s.full_name,o.name
                ORDER BY readiness_score DESC, progress_percent DESC, s.full_name
                LIMIT :limit OFFSET :offset
                """, """
                SELECT COUNT(*) FROM (
                    SELECT s.id
                    FROM users s JOIN user_roles ur ON ur.user_id=s.id JOIN roles r ON r.id=ur.role_id AND r.code='STUDENT'
                    LEFT JOIN organizations o ON o.id=s.organization_id
                    WHERE (:search = '' OR LOWER(s.full_name) LIKE LOWER('%' || :search || '%') OR LOWER(COALESCE(o.name,'')) LIKE LOWER('%' || :search || '%'))
                    GROUP BY s.id
                ) q
                """, db.params("search", normalized), page, size).asMap());
    }

    @GetMapping("/shortlists")
    public ApiResponse<Map<String, Object>> shortlists(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID recruiterId = currentUser.getCurrentUserId();
        return ApiResponse.success(db.page("""
                SELECT rs.student_id, rs.notes, rs.created_at,
                       s.full_name, COALESCE(o.name,'Independent') AS organization_name,
                       ROUND(COALESCE(AVG(a.score),0),1) AS readiness_score
                FROM recruiter_shortlists rs
                JOIN users s ON s.id=rs.student_id
                LEFT JOIN organizations o ON o.id=s.organization_id
                LEFT JOIN assessment_attempts a ON a.student_id=s.id AND a.status='completed'
                WHERE rs.recruiter_id=:id
                GROUP BY rs.student_id,rs.notes,rs.created_at,s.full_name,o.name
                ORDER BY rs.created_at DESC
                LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM recruiter_shortlists WHERE recruiter_id=:id", Map.of("id", recruiterId), page, size).asMap());
    }

    @PostMapping("/shortlists")
    public ApiResponse<Map<String, Object>> addShortlist(@RequestBody Map<String, Object> body) {
        UUID recruiterId = currentUser.getCurrentUserId();
        UUID studentId = db.uuid(String.valueOf(body.getOrDefault("studentId", "")));
        boolean studentExists = db.count("SELECT COUNT(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.id=:studentId AND r.code='STUDENT'", Map.of("studentId", studentId)) > 0;
        if (!studentExists) return ApiResponse.error("Student not found");
        Map<String, Object> shortlistParams = new LinkedHashMap<>();
        shortlistParams.put("recruiterId", recruiterId);
        shortlistParams.put("studentId", studentId);
        shortlistParams.put("notes", body.get("notes") == null ? "" : body.get("notes"));
        db.update("INSERT INTO recruiter_shortlists(recruiter_id,student_id,notes) VALUES(:recruiterId,:studentId,:notes) ON CONFLICT(recruiter_id,student_id) DO UPDATE SET notes=EXCLUDED.notes", shortlistParams);
        db.touchAudit(recruiterId, "RECRUITER_SHORTLISTED", "student", studentId.toString(), "Candidate shortlisted");
        return ApiResponse.success(Map.of("studentId", studentId, "shortlisted", true));
    }

    @DeleteMapping("/shortlists/{studentId}")
    public ApiResponse<Void> removeShortlist(@PathVariable String studentId) {
        db.update("DELETE FROM recruiter_shortlists WHERE recruiter_id=:recruiterId AND student_id=:studentId", Map.of("recruiterId", currentUser.getCurrentUserId(), "studentId", db.uuid(studentId)));
        return ApiResponse.success("Candidate removed from shortlist");
    }

    @GetMapping("/jobs")
    public ApiResponse<Map<String, Object>> jobs(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID recruiterId = currentUser.getCurrentUserId();
        return ApiResponse.success(db.page("""
                SELECT j.id,j.title,j.description,j.location,j.openings,j.status,j.created_at,j.updated_at,COUNT(a.id) AS application_count
                FROM job_openings j LEFT JOIN job_applications a ON a.job_id=j.id
                WHERE j.recruiter_id=:id
                GROUP BY j.id,j.title,j.description,j.location,j.openings,j.status,j.created_at,j.updated_at
                ORDER BY j.created_at DESC
                LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM job_openings WHERE recruiter_id=:id", Map.of("id", recruiterId), page, size).asMap());
    }

    @PostMapping("/jobs")
    public ApiResponse<Map<String, Object>> createJob(@RequestBody Map<String, Object> body) {
        UUID recruiterId = currentUser.getCurrentUserId();
        String title = String.valueOf(body.getOrDefault("title", "")).trim();
        if (title.isBlank()) return ApiResponse.error("Job title is required");
        int openings = body.get("openings") == null ? 1 : Integer.parseInt(String.valueOf(body.get("openings")));
        if (openings < 1) return ApiResponse.error("Openings must be at least 1");
        UUID id = UUID.randomUUID();
        db.update("INSERT INTO job_openings(id,recruiter_id,title,description,location,openings,status) VALUES(:id,:recruiterId,:title,:description,:location,:openings,:status)", Map.of("id", id, "recruiterId", recruiterId, "title", title, "description", body.get("description") == null ? "" : body.get("description"), "location", body.get("location") == null ? "" : body.get("location"), "openings", openings, "status", body.get("status") == null ? "open" : body.get("status")));
        db.touchAudit(recruiterId, "JOB_CREATED", "job_opening", id.toString(), title);
        return job(id.toString());
    }

    @GetMapping("/jobs/{id}") public ApiResponse<Map<String, Object>> getJob(@PathVariable String id) { return job(id); }

    @PutMapping("/jobs/{id}")
    public ApiResponse<Map<String, Object>> updateJob(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID recruiterId = currentUser.getCurrentUserId();
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("id", db.uuid(id)); params.put("recruiterId", recruiterId);
        params.put("title", body.get("title")); params.put("description", body.get("description"));
        params.put("location", body.get("location")); params.put("openings", body.get("openings")); params.put("status", body.get("status"));
        int changed = db.update("""
                UPDATE job_openings SET title=COALESCE(:title,title),description=COALESCE(:description,description),
                location=COALESCE(:location,location),openings=COALESCE(:openings,openings),status=COALESCE(:status,status),updated_at=NOW()
                WHERE id=:id AND recruiter_id=:recruiterId
                """, params);
        if (changed == 0) return ApiResponse.error("Job not found");
        return job(id);
    }

    @GetMapping("/pipeline")
    public ApiResponse<Map<String, Object>> pipeline(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID recruiterId = currentUser.getCurrentUserId();
        return ApiResponse.success(db.page("""
                SELECT a.id,a.status,a.applied_at,a.updated_at,s.full_name AS student_name,
                       COALESCE(o.name,'Independent') AS organization_name,j.title AS job_title
                FROM job_applications a
                JOIN job_openings j ON j.id=a.job_id AND j.recruiter_id=:id
                JOIN users s ON s.id=a.student_id
                LEFT JOIN organizations o ON o.id=s.organization_id
                ORDER BY a.updated_at DESC LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id", Map.of("id", recruiterId), page, size).asMap());
    }

    @PatchMapping("/pipeline/{id}")
    public ApiResponse<Map<String, Object>> updatePipeline(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID recruiterId = currentUser.getCurrentUserId();
        String status = String.valueOf(body.getOrDefault("status", "applied")).trim().toLowerCase();
        if (!PIPELINE_STAGES.contains(status)) return ApiResponse.error("Unsupported pipeline stage");
        int changed = db.update("""
                UPDATE job_applications a SET status=:status,updated_at=NOW()
                WHERE a.id=:id AND EXISTS (SELECT 1 FROM job_openings j WHERE j.id=a.job_id AND j.recruiter_id=:recruiterId)
                """, Map.of("id", db.uuid(id), "status", status, "recruiterId", recruiterId));
        if (changed == 0) return ApiResponse.error("Application not found");
        return ApiResponse.success(db.one("SELECT id,status,applied_at,updated_at FROM job_applications WHERE id=:id", Map.of("id", db.uuid(id))));
    }

    @GetMapping("/reports")
    public ApiResponse<Map<String, Object>> reports() {
        UUID recruiterId = currentUser.getCurrentUserId();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("summary", List.of(
                metric("jobs", "Jobs", db.count("SELECT COUNT(*) FROM job_openings WHERE recruiter_id=:id", Map.of("id", recruiterId)), "Openings created"),
                metric("applications", "Applications", db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id", Map.of("id", recruiterId)), "Candidate applications"),
                metric("interviews", "Interviews", db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id AND a.status='interview'", Map.of("id", recruiterId)), "Candidates in interview stage"),
                metric("hired", "Hired", db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id AND a.status='hired'", Map.of("id", recruiterId)), "Hired candidates")
        ));
        data.put("pipelineByStage", db.list("SELECT a.status AS stage,COUNT(*) AS count FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id GROUP BY a.status ORDER BY a.status", Map.of("id", recruiterId)));
        data.put("applicationsByMonth", db.list("SELECT TO_CHAR(date_trunc('month',a.applied_at),'YYYY-MM') AS month,COUNT(*) AS applications FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id AND a.applied_at >= NOW() - INTERVAL '12 months' GROUP BY 1 ORDER BY 1", Map.of("id", recruiterId)));
        return ApiResponse.success("Recruiter reports fetched", data);
    }

    @PostMapping(value="/reports/export", produces="text/csv")
    public String reportExport(@RequestBody(required=false) Map<String, Object> body) {
        UUID recruiterId = currentUser.getCurrentUserId();
        long jobs = db.count("SELECT COUNT(*) FROM job_openings WHERE recruiter_id=:id", Map.of("id", recruiterId));
        long applications = db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id", Map.of("id", recruiterId));
        long interviews = db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id AND a.status='interview'", Map.of("id", recruiterId));
        long hired = db.count("SELECT COUNT(*) FROM job_applications a JOIN job_openings j ON j.id=a.job_id WHERE j.recruiter_id=:id AND a.status='hired'", Map.of("id", recruiterId));
        return "metric,value\njobs,"+jobs+"\napplications,"+applications+"\ninterviews,"+interviews+"\nhired,"+hired+"\n";
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications() {
        return ApiResponse.success(db.list("SELECT id,title,body,created_at,read_flag AS read,action_label,action_href FROM notifications WHERE user_id=:id ORDER BY created_at DESC LIMIT 50", Map.of("id", currentUser.getCurrentUserId())));
    }

    private ApiResponse<Map<String, Object>> job(String id) {
        Map<String, Object> row = db.one("SELECT j.id,j.title,j.description,j.location,j.openings,j.status,j.created_at,j.updated_at,COUNT(a.id) AS application_count FROM job_openings j LEFT JOIN job_applications a ON a.job_id=j.id WHERE j.id=:id AND j.recruiter_id=:recruiterId GROUP BY j.id,j.title,j.description,j.location,j.openings,j.status,j.created_at,j.updated_at", Map.of("id", db.uuid(id), "recruiterId", currentUser.getCurrentUserId()));
        return row == null ? ApiResponse.error("Job not found") : ApiResponse.success(row);
    }

    private Map<String, Object> metric(String id, String label, Object value, String helper) {
        return Map.of("id", id, "label", label, "value", value, "helperText", helper);
    }
}

package com.itsdeligh.platform.institution;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.itsdeligh.platform.common.api.ApiResponse;
import com.itsdeligh.platform.common.data.PlatformJdbcService;
import com.itsdeligh.platform.common.exception.ApiException;
import com.itsdeligh.platform.common.security.CurrentUserProvider;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/institution")
@PreAuthorize("hasRole('INSTITUTION')")
public class InstitutionController {
    private final PlatformJdbcService db;
    private final CurrentUserProvider currentUser;

    public InstitutionController(PlatformJdbcService db, CurrentUserProvider currentUser) {
        this.db = db;
        this.currentUser = currentUser;
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        UUID userId = currentUser.getCurrentUserId();
        UUID organizationId = organizationId(userId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("configured", organizationId != null);
        data.put("organization", organizationId == null ? null : db.one(
                "SELECT id, name, code, status FROM organizations WHERE id=:orgId",
                Map.of("orgId", organizationId)));
        if (organizationId == null) {
            data.put("metrics", List.of());
            data.put("recentBatches", List.of());
            data.put("courseProgress", List.of());
            data.put("recentEnrollments", List.of());
            return ApiResponse.success("Institution organization is not configured", data);
        }

        List<Map<String, Object>> metrics = List.of(
                metric("students", "Students", db.count("SELECT COUNT(DISTINCT u.id) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='STUDENT' AND u.organization_id=:orgId", Map.of("orgId", organizationId)), "Learners linked to this institution"),
                metric("trainers", "Trainers", db.count("SELECT COUNT(DISTINCT u.id) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='TRAINER' AND u.organization_id=:orgId", Map.of("orgId", organizationId)), "Trainers linked to this institution"),
                metric("programs", "Programs", db.count("SELECT COUNT(*) FROM courses WHERE organization_id=:orgId", Map.of("orgId", organizationId)), "Institution-linked learning programs"),
                metric("activeBatches", "Active batches", db.count("SELECT COUNT(*) FROM batches b JOIN courses c ON c.id=b.course_id WHERE c.organization_id=:orgId AND b.status='active'", Map.of("orgId", organizationId)), "Currently active learner cohorts"),
                metric("activeEnrollments", "Active enrollments", db.count("SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.organization_id=:orgId AND e.status='active'", Map.of("orgId", organizationId)), "Learner participation still in progress"),
                metric("completedEnrollments", "Completed enrollments", db.count("SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.organization_id=:orgId AND e.status='completed'", Map.of("orgId", organizationId)), "Completed learning journeys"),
                metric("placements", "Placements", db.count("SELECT COUNT(*) FROM job_applications ja JOIN users s ON s.id=ja.student_id JOIN job_openings jo ON jo.id=ja.job_id WHERE s.organization_id=:orgId AND ja.status='hired'", Map.of("orgId", organizationId)), "Reported employment outcomes")
        );
        data.put("metrics", metrics);
        data.put("recentBatches", db.list("""
                SELECT b.id, b.name, COALESCE(c.title,'Program') AS course_title,
                       COALESCE(t.full_name,'Unassigned') AS trainer_name,
                       COUNT(bs.student_id) AS student_count,
                       b.start_date, b.end_date, b.status
                FROM batches b
                JOIN courses c ON c.id=b.course_id AND c.organization_id=:orgId
                LEFT JOIN users t ON t.id=b.trainer_id
                LEFT JOIN batch_students bs ON bs.batch_id=b.id
                GROUP BY b.id, b.name, c.title, t.full_name, b.start_date, b.end_date, b.status
                ORDER BY COALESCE(b.start_date, CURRENT_DATE) DESC, b.created_at DESC
                LIMIT 8
                """, Map.of("orgId", organizationId)));
        data.put("courseProgress", db.list("""
                SELECT c.id, c.title AS course_title,
                       ROUND(COALESCE(AVG(e.progress_percent),0),1) AS progress_percent
                FROM courses c
                LEFT JOIN enrollments e ON e.course_id=c.id
                WHERE c.organization_id=:orgId
                GROUP BY c.id, c.title
                ORDER BY progress_percent DESC, c.title
                LIMIT 10
                """, Map.of("orgId", organizationId)));
        data.put("recentEnrollments", db.list("""
                SELECT e.id, e.enrolled_at, e.status,
                       s.full_name AS student_name, c.title AS course_title
                FROM enrollments e
                JOIN users s ON s.id=e.student_id
                JOIN courses c ON c.id=e.course_id AND c.organization_id=:orgId
                ORDER BY e.enrolled_at DESC
                LIMIT 8
                """, Map.of("orgId", organizationId)));
        return ApiResponse.success("Institution dashboard fetched", data);
    }

    @GetMapping("/programs")
    public ApiResponse<Map<String, Object>> programs(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID orgId = requireOrganization();
        return ApiResponse.success(db.page("""
                SELECT c.id, c.title, c.category, c.level, c.status, c.approval_status,
                       c.created_at, c.updated_at, COALESCE(t.full_name,'Unassigned') AS trainer_name,
                       COUNT(DISTINCT b.id) AS batch_count
                FROM courses c
                LEFT JOIN users t ON t.id=c.trainer_id
                LEFT JOIN batches b ON b.course_id=c.id
                WHERE c.organization_id=:orgId
                GROUP BY c.id, c.title, c.category, c.level, c.status, c.approval_status, c.created_at, c.updated_at, t.full_name
                ORDER BY c.updated_at DESC
                LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM courses WHERE organization_id=:orgId", Map.of("orgId", orgId), page, size).asMap());
    }

    @PostMapping("/programs")
    public ApiResponse<Map<String, Object>> createProgram(@RequestBody Map<String, Object> body) {
        UUID orgId = requireOrganization();
        String title = String.valueOf(body.getOrDefault("title", "")).trim();
        if (title.isBlank()) return ApiResponse.error("Program title is required");
        UUID id = UUID.randomUUID();
        db.update("""
                INSERT INTO courses(id,title,category,level,description,status,approval_status,organization_id)
                VALUES(:id,:title,:category,:level,:description,'draft','pending',:orgId)
                """, Map.of("id", id, "title", title,
                "category", body.get("category") == null ? "" : body.get("category"),
                "level", body.get("level") == null ? "Beginner to Advanced" : body.get("level"),
                "description", body.get("description") == null ? "" : body.get("description"), "orgId", orgId));
        db.touchAudit(currentUser.getCurrentUserId(), "INSTITUTION_PROGRAM_CREATED", "course", id.toString(), title);
        return program(id.toString());
    }

    @GetMapping("/programs/{id}")
    public ApiResponse<Map<String, Object>> getProgram(@PathVariable String id) { return program(id); }

    @PutMapping("/programs/{id}")
    public ApiResponse<Map<String, Object>> updateProgram(@PathVariable String id, @RequestBody Map<String, Object> body) {
        UUID orgId = requireOrganization();
        UUID programId = db.uuid(id);
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("id", programId); params.put("orgId", orgId);
        params.put("title", body.get("title")); params.put("category", body.get("category"));
        params.put("level", body.get("level")); params.put("description", body.get("description"));
        int changed = db.update("""
                UPDATE courses SET
                    title=COALESCE(:title,title),
                    category=COALESCE(:category,category),
                    level=COALESCE(:level,level),
                    description=COALESCE(:description,description),
                    updated_at=NOW()
                WHERE id=:id AND organization_id=:orgId
                """, params);
        if (changed == 0) return ApiResponse.error("Program not found");
        return program(id);
    }

    @DeleteMapping("/programs/{id}")
    public ApiResponse<Void> deleteProgram(@PathVariable String id) {
        UUID orgId = requireOrganization();
        db.update("DELETE FROM courses WHERE id=:id AND organization_id=:orgId", Map.of("id", db.uuid(id), "orgId", orgId));
        return ApiResponse.success("Program removed");
    }

    @GetMapping("/students")
    public ApiResponse<Map<String, Object>> students(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size, @RequestParam(required=false) String search) {
        UUID orgId = requireOrganization();
        String normalized = search == null ? "" : search.trim();
        return ApiResponse.success(db.page("""
                SELECT s.id, s.full_name, s.email,
                       COALESCE(c.title,'—') AS course_title,
                       COALESCE(b.name,'—') AS batch_name,
                       COALESCE(MAX(e.progress_percent),0) AS progress_percent,
                       COALESCE(ROUND(AVG(a.score),1),0) AS assessment_score,
                       CASE WHEN s.is_active THEN 'active' ELSE 'inactive' END AS status
                FROM users s
                JOIN user_roles ur ON ur.user_id=s.id
                JOIN roles r ON r.id=ur.role_id AND r.code='STUDENT'
                LEFT JOIN enrollments e ON e.student_id=s.id
                LEFT JOIN courses c ON c.id=e.course_id AND c.organization_id=:orgId
                LEFT JOIN batch_students bs ON bs.student_id=s.id
                LEFT JOIN batches b ON b.id=bs.batch_id AND EXISTS (SELECT 1 FROM courses bc WHERE bc.id=b.course_id AND bc.organization_id=:orgId)
                LEFT JOIN assessment_attempts a ON a.student_id=s.id AND a.status='completed'
                WHERE s.organization_id=:orgId
                  AND (:search = '' OR LOWER(s.full_name) LIKE LOWER('%' || :search || '%') OR LOWER(s.email) LIKE LOWER('%' || :search || '%'))
                GROUP BY s.id, s.full_name, s.email, c.title, b.name, s.is_active
                ORDER BY s.full_name
                LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(DISTINCT s.id) FROM users s JOIN user_roles ur ON ur.user_id=s.id JOIN roles r ON r.id=ur.role_id WHERE r.code='STUDENT' AND s.organization_id=:orgId AND (:search = '' OR LOWER(s.full_name) LIKE LOWER('%' || :search || '%') OR LOWER(s.email) LIKE LOWER('%' || :search || '%'))", db.params("orgId", orgId, "search", normalized), page, size).asMap());
    }

    @GetMapping("/trainers")
    public ApiResponse<Map<String, Object>> trainers(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID orgId = requireOrganization();
        return ApiResponse.success(db.page("""
                SELECT t.id, t.full_name, t.email, t.is_active,
                       COUNT(DISTINCT c.id) AS program_count,
                       COUNT(DISTINCT b.id) AS batch_count,
                       COUNT(DISTINCT bs.student_id) AS student_count,
                       CASE WHEN t.is_active THEN 'active' ELSE 'inactive' END AS status
                FROM users t
                JOIN user_roles ur ON ur.user_id=t.id
                JOIN roles r ON r.id=ur.role_id AND r.code='TRAINER'
                LEFT JOIN courses c ON c.trainer_id=t.id AND c.organization_id=:orgId
                LEFT JOIN batches b ON b.trainer_id=t.id AND b.course_id=c.id
                LEFT JOIN batch_students bs ON bs.batch_id=b.id
                WHERE t.organization_id=:orgId
                GROUP BY t.id, t.full_name, t.email, t.is_active
                ORDER BY t.full_name
                LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(DISTINCT t.id) FROM users t JOIN user_roles ur ON ur.user_id=t.id JOIN roles r ON r.id=ur.role_id WHERE r.code='TRAINER' AND t.organization_id=:orgId", Map.of("orgId", orgId), page, size).asMap());
    }

    @GetMapping("/batches")
    public ApiResponse<Map<String, Object>> batches(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID orgId = requireOrganization();
        return ApiResponse.success(db.page("""
                SELECT b.id, b.name, c.title AS course_title, COALESCE(t.full_name,'Unassigned') AS trainer_name,
                       COUNT(bs.student_id) AS student_count, b.start_date, b.end_date, b.status
                FROM batches b
                JOIN courses c ON c.id=b.course_id AND c.organization_id=:orgId
                LEFT JOIN users t ON t.id=b.trainer_id
                LEFT JOIN batch_students bs ON bs.batch_id=b.id
                GROUP BY b.id, b.name, c.title, t.full_name, b.start_date, b.end_date, b.status
                ORDER BY COALESCE(b.start_date,CURRENT_DATE) DESC, b.created_at DESC
                LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM batches b JOIN courses c ON c.id=b.course_id WHERE c.organization_id=:orgId", Map.of("orgId", orgId), page, size).asMap());
    }

    @GetMapping("/reports")
    public ApiResponse<Map<String, Object>> reports() {
        UUID orgId = requireOrganization();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("summary", List.of(
                metric("learners", "Learners", db.count("SELECT COUNT(DISTINCT u.id) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='STUDENT' AND u.organization_id=:orgId", Map.of("orgId", orgId)), "Institution-linked students"),
                metric("averageProgress", "Average progress", db.one("SELECT ROUND(COALESCE(AVG(e.progress_percent),0),1) AS value FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.organization_id=:orgId", Map.of("orgId", orgId)).get("value") instanceof Number n ? n.longValue() : 0L, "Average completion across enrollments"),
                metric("completions", "Completed journeys", db.count("SELECT COUNT(*) FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE c.organization_id=:orgId AND e.status='completed'", Map.of("orgId", orgId)), "Completed learning journeys"),
                metric("placements", "Placements", db.count("SELECT COUNT(*) FROM job_applications ja JOIN users s ON s.id=ja.student_id WHERE s.organization_id=:orgId AND ja.status='hired'", Map.of("orgId", orgId)), "Hired outcomes reported by recruiters")
        ));
        data.put("coursePerformance", db.list("""
                SELECT c.title AS course_title, ROUND(COALESCE(AVG(e.progress_percent),0),1) AS average_progress
                FROM courses c LEFT JOIN enrollments e ON e.course_id=c.id
                WHERE c.organization_id=:orgId
                GROUP BY c.id,c.title ORDER BY average_progress DESC,c.title LIMIT 10
                """, Map.of("orgId", orgId)));
        data.put("monthlyEnrollment", db.list("""
                SELECT TO_CHAR(date_trunc('month',e.enrolled_at),'YYYY-MM') AS month, COUNT(*) AS enrollments
                FROM enrollments e JOIN courses c ON c.id=e.course_id
                WHERE c.organization_id=:orgId AND e.enrolled_at >= NOW() - INTERVAL '12 months'
                GROUP BY 1 ORDER BY 1
                """, Map.of("orgId", orgId)));
        return ApiResponse.success("Institution reports fetched", data);
    }

    @GetMapping("/placements")
    public ApiResponse<Map<String, Object>> placements(@RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="20") int size) {
        UUID orgId = requireOrganization();
        return ApiResponse.success(db.page("""
                SELECT ja.id, s.full_name AS student_name, jo.title AS job_title,
                       r.full_name AS recruiter_name, ja.status, ja.applied_at, ja.updated_at
                FROM job_applications ja
                JOIN users s ON s.id=ja.student_id AND s.organization_id=:orgId
                JOIN job_openings jo ON jo.id=ja.job_id
                JOIN users r ON r.id=jo.recruiter_id
                ORDER BY ja.updated_at DESC
                LIMIT :limit OFFSET :offset
                """, "SELECT COUNT(*) FROM job_applications ja JOIN users s ON s.id=ja.student_id WHERE s.organization_id=:orgId", Map.of("orgId", orgId), page, size).asMap());
    }

    @PostMapping(value="/reports/export", produces="text/csv")
    public String reportExport(@RequestBody(required=false) Map<String, Object> body) {
        UUID orgId = requireOrganization();
        long learners = db.count("SELECT COUNT(DISTINCT u.id) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='STUDENT' AND u.organization_id=:orgId", Map.of("orgId", orgId));
        long programs = db.count("SELECT COUNT(*) FROM courses WHERE organization_id=:orgId", Map.of("orgId", orgId));
        long batches = db.count("SELECT COUNT(*) FROM batches b JOIN courses c ON c.id=b.course_id WHERE c.organization_id=:orgId", Map.of("orgId", orgId));
        long placements = db.count("SELECT COUNT(*) FROM job_applications ja JOIN users s ON s.id=ja.student_id WHERE s.organization_id=:orgId AND ja.status='hired'", Map.of("orgId", orgId));
        return "metric,value\nlearners,"+learners+"\nprograms,"+programs+"\nbatches,"+batches+"\nplacements,"+placements+"\n";
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications() {
        return ApiResponse.success(db.list("SELECT id,title,body,created_at,read_flag AS read,action_label,action_href FROM notifications WHERE user_id=:id ORDER BY created_at DESC LIMIT 50", Map.of("id", currentUser.getCurrentUserId())));
    }

    private ApiResponse<Map<String, Object>> program(String id) {
        UUID orgId = requireOrganization();
        Map<String, Object> row = db.one("SELECT id,title,category,level,description,status,approval_status,trainer_id,organization_id,created_at,updated_at FROM courses WHERE id=:id AND organization_id=:orgId", Map.of("id", db.uuid(id), "orgId", orgId));
        return row == null ? ApiResponse.error("Program not found") : ApiResponse.success(row);
    }

    private UUID organizationId(UUID userId) {
        Map<String, Object> row = db.one("SELECT organization_id FROM users WHERE id=:id", Map.of("id", userId));
        Object value = row == null ? null : row.get("organization_id");
        return value == null ? null : (value instanceof UUID uuid ? uuid : db.uuid(String.valueOf(value)));
    }

    private UUID requireOrganization() {
        UUID orgId = organizationId(currentUser.getCurrentUserId());
        if (orgId == null) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Institution organization is not configured");
        return orgId;
    }

    private Map<String, Object> metric(String id, String label, Object value, String helper) {
        return Map.of("id", id, "label", label, "value", value, "helperText", helper);
    }
}

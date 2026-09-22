package com.itsdeligh.platform.student;

import java.time.OffsetDateTime;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {
    private final PlatformJdbcService db;
    private final CurrentUserProvider currentUser;

    public StudentController(PlatformJdbcService db, CurrentUserProvider currentUser) {
        this.db = db;
        this.currentUser = currentUser;
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        UUID id = currentUser.getCurrentUserId();
        Map<String, Object> user = db.one("SELECT full_name FROM users WHERE id = :id", Map.of("id", id));
        long enrolled = db.count("SELECT COUNT(*) FROM enrollments WHERE student_id = :id", Map.of("id", id));
        long completed = db.count("SELECT COUNT(*) FROM enrollments WHERE student_id = :id AND status = 'completed'", Map.of("id", id));
        int progress = enrolled == 0 ? 0 : (int) Math.round((completed * 100.0) / enrolled);
        int totalAssessments = (int) db.count("SELECT COUNT(*) FROM assessment_attempts WHERE student_id = :id", Map.of("id", id));

        List<Map<String, Object>> topPerformers = db.list("""
                  SELECT u.id, u.full_name AS name, COALESCE(MAX(c.title), 'Soft Skills') AS track,
                      ROW_NUMBER() OVER (ORDER BY COALESCE(scores.average_score,0) DESC, u.full_name) AS rank
                FROM users u
                LEFT JOIN enrollments e ON e.student_id = u.id
                LEFT JOIN courses c ON c.id = e.course_id
                  LEFT JOIN (SELECT student_id, AVG(score) AS average_score FROM assessment_attempts WHERE status = 'completed' GROUP BY student_id) scores ON scores.student_id = u.id
                WHERE EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.code = 'STUDENT')
                  GROUP BY u.id, u.full_name, scores.average_score
                  ORDER BY COALESCE(scores.average_score,0) DESC, u.full_name
                LIMIT 3
                """, Map.of());
        List<Map<String, Object>> performers = new ArrayList<>();
        for (Map<String, Object> row : topPerformers) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", row.get("id"));
            item.put("name", row.get("name"));
            item.put("track", row.get("track"));
            item.put("rank", ((Number) row.get("rank")).intValue());
            performers.add(item);
        }

        List<Map<String, Object>> rankList = db.list("""
                  SELECT ROW_NUMBER() OVER (ORDER BY COALESCE(scores.average_score,0) DESC, u.full_name) AS rank,
                       u.full_name AS name, COALESCE(MAX(c.title), 'Soft Skills') AS course
                FROM users u
                LEFT JOIN enrollments e ON e.student_id = u.id
                LEFT JOIN courses c ON c.id = e.course_id
                  LEFT JOIN (SELECT student_id, AVG(score) AS average_score FROM assessment_attempts WHERE status = 'completed' GROUP BY student_id) scores ON scores.student_id = u.id
                WHERE EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.code = 'STUDENT')
                  GROUP BY u.id, u.full_name, scores.average_score
                  ORDER BY COALESCE(scores.average_score,0) DESC, u.full_name
                LIMIT 10
                """, Map.of());

        List<Map<String, Object>> cards = List.of(
                Map.of("id", "learning", "title", "Continue Learning", "description", enrolled + " active course" + (enrolled == 1 ? "" : "s"), "href", "/student/learning", "icon", "learning"),
                Map.of("id", "classes", "title", "Upcoming Classes", "description", "View your live class schedule", "href", "/student/dashboard", "icon", "classes"),
                Map.of("id", "assessment", "title", "Assessments", "description", totalAssessments + " attempt" + (totalAssessments == 1 ? "" : "s") + " recorded", "href", "/student/assessment", "icon", "assessment"),
                Map.of("id", "career", "title", "Career Readiness", "description", "Track skills and goals", "href", "/student/career", "icon", "recommended")
        );
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("welcomeName", user == null ? "Student" : user.get("full_name"));
        data.put("weekProgressPercent", progress);
        data.put("summaryCards", cards);
        data.put("topPerformers", performers.stream().limit(3).toList());
        data.put("rankList", rankList);
        return ApiResponse.success("Dashboard fetched", data);
    }

    @GetMapping("/schedule")
    public ApiResponse<List<Map<String, Object>>> schedule() {
        UUID id = currentUser.getCurrentUserId();
        List<Map<String, Object>> rows = db.list("""
                SELECT s.id, s.title, COALESCE(t.full_name, 'Trainer') AS trainer_name,
                       s.starts_at, s.duration_minutes
                FROM sessions s
                JOIN batch_students bs ON bs.batch_id = s.batch_id AND bs.student_id = :id
                LEFT JOIN users t ON t.id = s.trainer_id
                WHERE s.starts_at >= NOW() - INTERVAL '1 day'
                ORDER BY s.starts_at
                LIMIT 20
                """, Map.of("id", id));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            out.add(Map.of(
                    "id", r.get("id"), "title", r.get("title"), "trainerName", r.get("trainer_name"),
                    "startsAt", r.get("starts_at"), "durationMinutes", r.get("duration_minutes")
            ));
        }
        return ApiResponse.success(out);
    }

    @GetMapping("/courses")
    public ApiResponse<List<Map<String, Object>>> courses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        UUID id = currentUser.getCurrentUserId();
        String normalizedCategory = category == null ? "" : category.trim();
        String normalizedSearch = search == null ? "" : search.trim();
        List<Map<String, Object>> rows = db.list("""
                SELECT c.id, c.title, c.category, c.level, c.rating, c.review_count, c.description,
                       c.image_url, c.learning_outcomes::text AS learning_outcomes, c.chapter_count,
                       c.duration, c.certificate_eta,
                       EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = :studentId) AS enrolled
                FROM courses c
                WHERE c.status = 'published'
                  AND (:category = '' OR LOWER(c.category) = LOWER(:category))
                  AND (:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')))
                ORDER BY c.created_at DESC
                """, db.params("studentId", id, "category", normalizedCategory, "search", normalizedSearch));
        return ApiResponse.success(rows.stream().map(this::courseMap).toList());
    }

    @GetMapping("/courses/{courseId}")
    public ApiResponse<Map<String, Object>> course(@PathVariable String courseId) {
        UUID studentId = currentUser.getCurrentUserId();
        Map<String, Object> row = db.one("""
                SELECT c.id, c.title, c.category, c.level, c.rating, c.review_count, c.description,
                       c.image_url, c.learning_outcomes::text AS learning_outcomes, c.chapter_count,
                       c.duration, c.certificate_eta,
                       EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = :studentId) AS enrolled
                FROM courses c WHERE c.id = :courseId AND c.status = 'published'
                """, Map.of("courseId", db.uuid(courseId), "studentId", studentId));
        if (row == null) return ApiResponse.error("Course not found");
        return ApiResponse.success(courseMap(row));
    }

    @PostMapping("/courses/{courseId}/enroll")
    public ApiResponse<Map<String, Object>> enroll(@PathVariable String courseId) {
        UUID studentId = currentUser.getCurrentUserId();
        UUID course = db.uuid(courseId);
        if (db.one("SELECT id FROM courses WHERE id = :id AND status = 'published'", Map.of("id", course)) == null) {
            return ApiResponse.error("Course is not available");
        }
        db.update("""
                INSERT INTO enrollments (student_id, course_id, status)
                VALUES (:studentId, :courseId, 'active')
                ON CONFLICT (student_id, course_id) DO NOTHING
                """, Map.of("studentId", studentId, "courseId", course));
        return ApiResponse.success(Map.of("enrolled", true));
    }

    @GetMapping("/assessments")
    public ApiResponse<List<Map<String, Object>>> assessments(@RequestParam(required = false) String status) {
        UUID studentId = currentUser.getCurrentUserId();
        String normalized = status == null ? "" : status.trim().toLowerCase();
        List<Map<String, Object>> rows = db.list("""
                SELECT a.id, a.title, a.status, a.question_count, a.duration_minutes, a.due_at,
                       EXISTS (SELECT 1 FROM assessment_attempts aa WHERE aa.assessment_id = a.id AND aa.student_id = :studentId AND aa.status = 'completed') AS completed
                FROM assessments a
                WHERE (a.status <> 'draft')
                  AND (:status = '' OR :status = 'all'
                       OR (:status = 'completed' AND EXISTS (SELECT 1 FROM assessment_attempts aa WHERE aa.assessment_id = a.id AND aa.student_id = :studentId AND aa.status = 'completed'))
                       OR (:status = a.status AND NOT EXISTS (SELECT 1 FROM assessment_attempts aa WHERE aa.assessment_id = a.id AND aa.student_id = :studentId AND aa.status = 'completed')))
                ORDER BY a.due_at NULLS LAST, a.created_at DESC
                """, db.params("studentId", studentId, "status", normalized));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            String state = Boolean.TRUE.equals(r.get("completed")) ? "completed" : String.valueOf(r.get("status"));
            out.add(db.params("id", r.get("id"), "title", r.get("title"), "status", state,
                    "questionCount", r.get("question_count"), "durationMinutes", r.get("duration_minutes"),
                    "dueAt", r.get("due_at")));
        }
        return ApiResponse.success(out);
    }

    @GetMapping("/assessments/{assessmentId}")
    public ApiResponse<Map<String, Object>> assessmentDetail(@PathVariable String assessmentId) {
        UUID studentId = currentUser.getCurrentUserId();
        Map<String, Object> row = db.one("SELECT * FROM assessments WHERE id = :id", Map.of("id", db.uuid(assessmentId)));
        if (row == null) return ApiResponse.error("Assessment not found");
        long attempted = db.count("SELECT COUNT(*) FROM assessment_answers WHERE attempt_id IN (SELECT id FROM assessment_attempts WHERE assessment_id = :assessment AND student_id = :student)", Map.of("assessment", db.uuid(assessmentId), "student", studentId));
        long totalQuestions = ((Number) row.get("question_count")).longValue();
        int sectionSize = Math.max(1, (int) Math.ceil(totalQuestions / 4.0));
        List<Map<String, Object>> sections = List.of(
                Map.ofEntries(Map.entry("label", "Communication"), Map.entry("description", "Clarity, listening and professional expression."), Map.entry("questionCount", sectionSize)),
                Map.ofEntries(Map.entry("label", "Collaboration"), Map.entry("description", "Teamwork, empathy and conflict handling."), Map.entry("questionCount", sectionSize)),
                Map.ofEntries(Map.entry("label", "Problem Solving"), Map.entry("description", "Decision making and structured thinking."), Map.entry("questionCount", sectionSize)),
                Map.ofEntries(Map.entry("label", "Workplace Readiness"), Map.entry("description", "Adaptability, ownership and professional conduct."), Map.entry("questionCount", Math.max(1, (int) totalQuestions - sectionSize * 3)))
        );
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", row.get("id")); data.put("title", row.get("title")); data.put("status", row.get("status"));
        data.put("questionCount", row.get("question_count")); data.put("durationMinutes", row.get("duration_minutes")); data.put("dueAt", row.get("due_at"));
        data.put("sections", sections);
        data.put("tips", List.of(
                Map.of("title", "Read carefully", "description", "Treat each scenario as a workplace situation."),
                Map.of("title", "Stay consistent", "description", "Choose responses that match your real working style."),
                Map.of("title", "Manage time", "description", "Keep a steady pace so every section gets attention."),
                Map.of("title", "Review before submitting", "description", "Make sure your final responses are complete.")
        ));
        data.put("timeRemainingMinutes", ((Number) row.get("duration_minutes")).intValue());
        data.put("questionsAttempted", Math.min(attempted, totalQuestions));
        data.put("questionsTotal", totalQuestions);
        data.put("skillCoverage", List.of(
                Map.of("label", "Communication", "percent", 0), Map.of("label", "Collaboration", "percent", 0),
                Map.of("label", "Problem Solving", "percent", 0), Map.of("label", "Workplace Readiness", "percent", 0)
        ));
        return ApiResponse.success(data);
    }

    @PostMapping("/assessments/{assessmentId}/start")
    public ApiResponse<Map<String, Object>> start(@PathVariable String assessmentId) {
        UUID studentId = currentUser.getCurrentUserId();
        UUID assessment = db.uuid(assessmentId);
        if (db.one("SELECT id FROM assessments WHERE id = :id", Map.of("id", assessment)) == null) return ApiResponse.error("Assessment not found");
        Map<String, Object> existing = db.one("SELECT id FROM assessment_attempts WHERE assessment_id = :assessment AND student_id = :student AND status = 'started' ORDER BY started_at DESC LIMIT 1", Map.of("assessment", assessment, "student", studentId));
        UUID attemptId = existing == null ? UUID.randomUUID() : (UUID) existing.get("id");
        if (existing == null) {
            db.update("INSERT INTO assessment_attempts (id, assessment_id, student_id, status) VALUES (:id, :assessment, :student, 'started')",
                    Map.of("id", attemptId, "assessment", assessment, "student", studentId));
        }
        return ApiResponse.success(Map.of("attemptId", attemptId));
    }

    @PostMapping("/assessments/{assessmentId}/submit")
    public ApiResponse<Map<String, Object>> submitAttempt(@PathVariable String assessmentId, @RequestBody Map<String, Object> body) {
        UUID studentId = currentUser.getCurrentUserId();
        UUID assessment = db.uuid(assessmentId);
        UUID attempt = body.get("attemptId") == null ? null : db.uuid(String.valueOf(body.get("attemptId")));
        if (attempt == null) return ApiResponse.error("Attempt id is required");
        Map<String, Object> owner = db.one("SELECT id FROM assessment_attempts WHERE id = :attempt AND assessment_id = :assessment AND student_id = :student", Map.of("attempt", attempt, "assessment", assessment, "student", studentId));
        if (owner == null) return ApiResponse.error("Assessment attempt not found");
        Object rawAnswers = body.get("answers");
        if (rawAnswers instanceof Map<?, ?> answers) {
            for (Map.Entry<?, ?> entry : answers.entrySet()) {
                int questionNumber;
                try { questionNumber = Integer.parseInt(String.valueOf(entry.getKey())) + 1; } catch (Exception ex) { continue; }
                db.update("INSERT INTO assessment_answers(id,attempt_id,question_number,answer_text) VALUES(:id,:attempt,:number,:answer) ON CONFLICT(attempt_id,question_number) DO UPDATE SET answer_text=:answer",
                        Map.of("id", UUID.randomUUID(), "attempt", attempt, "number", questionNumber, "answer", String.valueOf(entry.getValue())));
            }
        }
        db.update("UPDATE assessment_attempts SET status = 'completed', score = NULL, completed_at = NOW() WHERE id = :id", Map.of("id", attempt));
        db.touchAudit(studentId, "ASSESSMENT_SUBMITTED", "assessment", assessmentId, "Online assessment submitted");
        return ApiResponse.success(Map.of("submitted", true, "attemptId", attempt));
    }

    @PostMapping(value = "/assessments/{assessmentId}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Map<String, Object>> submitWork(
            @PathVariable String assessmentId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "comments", required = false) String comments
    ) {
        UUID studentId = currentUser.getCurrentUserId();
        UUID assessment = db.uuid(assessmentId);
        if (file.isEmpty() || file.getSize() > 50L * 1024 * 1024) return ApiResponse.error("File is empty or exceeds 50MB");
        db.update("""
                INSERT INTO assessment_submissions (assessment_id, student_id, file_name, file_size, comments)
                VALUES (:assessment, :student, :name, :size, :comments)
                """, Map.of("assessment", assessment, "student", studentId, "name", file.getOriginalFilename() == null ? "submission" : file.getOriginalFilename(), "size", file.getSize(), "comments", comments == null ? "" : comments));
        db.touchAudit(studentId, "WORK_SUBMITTED", "assessment", assessmentId, file.getOriginalFilename());
        return ApiResponse.success(Map.of("submitted", true));
    }

    @GetMapping("/career")
    public ApiResponse<Map<String, Object>> career() {
        UUID studentId = currentUser.getCurrentUserId();
        int enrolled = (int) db.count("SELECT COUNT(*) FROM enrollments WHERE student_id = :id", Map.of("id", studentId));
        int completed = (int) db.count("SELECT COUNT(*) FROM enrollments WHERE student_id = :id AND status = 'completed'", Map.of("id", studentId));
        int assessments = (int) db.count("SELECT COUNT(*) FROM assessment_attempts WHERE student_id = :id AND status = 'completed'", Map.of("id", studentId));
        int certificates = (int) db.count("SELECT COUNT(*) FROM enrollments WHERE student_id = :id AND certificate_issued = TRUE", Map.of("id", studentId));
        return ApiResponse.success(Map.of("readinessPercent", Math.min(100, completed * 50 + assessments * 10),
                "skill", Map.of("done", completed, "total", Math.max(enrolled, 1)),
                "experience", Map.of("done", 0, "total", 1),
                "certificates", Map.of("done", certificates, "total", Math.max(enrolled, 1)),
                "goals", Map.of("done", Math.min(3, completed), "total", 3)));
    }

    @GetMapping("/notifications")
    public ApiResponse<List<Map<String, Object>>> notifications() {
        UUID studentId = currentUser.getCurrentUserId();
        return ApiResponse.success(db.list("""
                SELECT id, title, body, created_at, read_flag AS read, action_label, action_href
                FROM notifications WHERE user_id = :id ORDER BY created_at DESC LIMIT 50
                """, Map.of("id", studentId)).stream().map(r -> db.params(
                "id", r.get("id"), "title", r.get("title"), "body", r.get("body"), "createdAt", r.get("created_at"),
                "read", r.get("read"), "actionLabel", r.get("action_label"), "actionHref", r.get("action_href")
        )).toList());
    }

    @PatchMapping("/notifications/{id}/read")
    public ApiResponse<Void> markNotificationRead(@PathVariable String id) {
        db.update("UPDATE notifications SET read_flag = TRUE WHERE id = :id AND user_id = :user", Map.of("id", db.uuid(id), "user", currentUser.getCurrentUserId()));
        return ApiResponse.success("Notification marked as read");
    }

    @DeleteMapping("/notifications/{id}")
    public ApiResponse<Void> deleteNotification(@PathVariable String id) {
        db.update("DELETE FROM notifications WHERE id = :id AND user_id = :user", Map.of("id", db.uuid(id), "user", currentUser.getCurrentUserId()));
        return ApiResponse.success("Notification deleted");
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile() {
        UUID id = currentUser.getCurrentUserId();
        Map<String, Object> row = db.one("SELECT full_name, COALESCE(role_title,'Student') AS role_title, COALESCE(about,'') AS about, COALESCE(mobile,'') AS mobile, email, gender, avatar_url FROM users WHERE id = :id", Map.of("id", id));
        if (row == null) return ApiResponse.error("Profile not found");
        return ApiResponse.success(profileMap(row));
    }

    @PutMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(@RequestBody Map<String, Object> body) {
        UUID id = currentUser.getCurrentUserId();
        db.update("""
                UPDATE users SET full_name = COALESCE(:fullName, full_name), mobile = COALESCE(:phone, mobile),
                role_title = COALESCE(:roleTitle, role_title), about = COALESCE(:about, about), gender = COALESCE(:gender, gender),
                avatar_url = COALESCE(:avatarUrl, avatar_url), updated_at = NOW() WHERE id = :id
                """, db.params("id", id, "fullName", body.get("fullName"), "phone", body.get("phone"), "roleTitle", body.get("roleTitle"), "about", body.get("about"), "gender", body.get("gender"), "avatarUrl", body.get("avatarUrl")));
        return profile();
    }

    private Map<String, Object> courseMap(Map<String, Object> row) {
        List<String> outcomes = new ArrayList<>();
        Object raw = row.get("learning_outcomes");
        if (raw != null) {
            String text = raw.toString().replace("[", "").replace("]", "").replace("\"", "");
            for (String item : text.split(",")) if (!item.isBlank()) outcomes.add(item.trim());
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", row.get("id")); out.put("title", row.get("title")); out.put("category", row.get("category"));
        out.put("level", row.get("level")); out.put("rating", row.get("rating")); out.put("reviewCount", row.get("review_count"));
        out.put("description", row.get("description")); out.put("imageUrl", row.get("image_url")); out.put("learningOutcomes", outcomes);
        out.put("chapterCount", row.get("chapter_count")); out.put("duration", row.get("duration")); out.put("certificateEta", row.get("certificate_eta")); out.put("enrolled", row.get("enrolled"));
        return out;
    }

    private Map<String, Object> profileMap(Map<String, Object> row) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("fullName", row.get("full_name")); out.put("roleTitle", row.get("role_title")); out.put("about", row.get("about"));
        out.put("phone", row.get("mobile")); out.put("email", row.get("email")); out.put("gender", row.get("gender")); out.put("avatarUrl", row.get("avatar_url"));
        return out;
    }
}

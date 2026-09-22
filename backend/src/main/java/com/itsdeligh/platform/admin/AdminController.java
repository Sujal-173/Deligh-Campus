package com.itsdeligh.platform.admin;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.itsdeligh.platform.common.api.ApiResponse;
import com.itsdeligh.platform.common.data.PlatformJdbcService;
import com.itsdeligh.platform.common.exception.ApiException;
import com.itsdeligh.platform.common.security.CurrentUserProvider;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminController {
    private final PlatformJdbcService db;
    private final CurrentUserProvider currentUser;

    public AdminController(PlatformJdbcService db, CurrentUserProvider currentUser) {
        this.db = db;
        this.currentUser = currentUser;
    }

    @GetMapping("/dashboard")
    public ApiResponse<Map<String,Object>> dashboard(){
        Map<String,Object> data=new LinkedHashMap<>();
        data.put("users", db.count("SELECT COUNT(*) FROM users",Map.of()));
        data.put("students", db.count("SELECT COUNT(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='STUDENT'",Map.of()));
        data.put("trainers", db.count("SELECT COUNT(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='TRAINER'",Map.of()));
        data.put("courses", db.count("SELECT COUNT(*) FROM courses",Map.of()));
        data.put("activeBatches", db.count("SELECT COUNT(*) FROM batches WHERE status='active'",Map.of()));
        data.put("pendingApprovals", db.count("SELECT COUNT(*) FROM courses WHERE approval_status='pending'",Map.of()));
        data.put("assessmentAttempts", db.count("SELECT COUNT(*) FROM assessment_attempts",Map.of()));
        data.put("activeUsers", db.count("SELECT COUNT(*) FROM users WHERE is_active=true",Map.of()));
        data.put("publishedCourses", db.count("SELECT COUNT(*) FROM courses WHERE status='published'",Map.of()));
        data.put("batches", db.count("SELECT COUNT(*) FROM batches",Map.of()));
        data.put("assessments", db.count("SELECT COUNT(*) FROM assessments",Map.of()));
        data.put("transactions", db.count("SELECT COUNT(*) FROM transactions",Map.of()));
        return ApiResponse.success(data);
    }

    @GetMapping("/users") public ApiResponse<Map<String,Object>> users(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(required=false)String search){
        String s=(search==null||search.isBlank())?"":search.trim();
        PlatformJdbcService.Page p=db.page("""
                SELECT u.id,u.full_name,u.email,u.mobile,u.email_verified,u.is_active,u.is_locked,u.created_at,COALESCE(u.role_title,'') role_title,
                       COALESCE(STRING_AGG(r.code, ',' ORDER BY r.code),'') roles
                FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id
                WHERE (:search = '' OR LOWER(u.full_name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%',:search,'%')))
                GROUP BY u.id ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset
                ""","SELECT COUNT(*) FROM users WHERE (:search = '' OR LOWER(full_name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(email) LIKE LOWER(CONCAT('%',:search,'%'))) ",db.params("search",s),page,size);
        List<Map<String,Object>> items=p.items().stream().map(r->db.params("id",r.get("id"),"fullName",r.get("full_name"),"email",r.get("email"),"mobile",r.get("mobile"),"emailVerified",r.get("email_verified"),"active",r.get("is_active"),"locked",r.get("is_locked"),"roles",String.valueOf(r.get("roles")).isBlank()?List.of():List.of(String.valueOf(r.get("roles")).split(",")),"roleTitle",r.get("role_title"),"createdAt",r.get("created_at"))).toList();
        return ApiResponse.success(new PlatformJdbcService.Page(items,p.page(),p.size(),p.totalItems(),p.totalPages()).asMap());
    }

    @GetMapping("/users/{id}") public ApiResponse<Map<String,Object>> user(@PathVariable String id){
        UUID user=db.uuid(id); Map<String,Object> r=db.one("SELECT id,full_name,email,mobile,email_verified,is_active,is_locked,created_at,updated_at FROM users WHERE id=:id",Map.of("id",user)); if(r==null)return ApiResponse.error("User not found");
        List<Map<String,Object>> roles=db.list("SELECT r.id,r.code,r.name FROM roles r JOIN user_roles ur ON ur.role_id=r.id WHERE ur.user_id=:id ORDER BY r.code",Map.of("id",user)); Map<String,Object> out=new LinkedHashMap<>(r);out.put("roles",roles);return ApiResponse.success(out);
    }

    @PutMapping("/users/{id}") public ApiResponse<Map<String,Object>> updateUser(@PathVariable String id,@RequestBody Map<String,Object> body){
        UUID actor=currentUser.getCurrentUserId(), user=db.uuid(id); Map<String,Object> p=new LinkedHashMap<>();p.put("id",user);p.put("name",body.get("fullName"));p.put("mobile",body.get("mobile"));db.update("UPDATE users SET full_name=COALESCE(:name,full_name),mobile=COALESCE(:mobile,mobile),updated_at=NOW() WHERE id=:id",p);db.touchAudit(actor,"USER_UPDATED","user",id,"Admin updated user");return user(id);
    }
    @PatchMapping("/users/{id}/status") public ApiResponse<Map<String,Object>> userStatus(@PathVariable String id,@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId(),user=db.uuid(id);String status=String.valueOf(body.getOrDefault("status","active")).trim().toLowerCase();if(!status.equals("active")&&!status.equals("inactive"))throw new ApiException(HttpStatus.BAD_REQUEST,"Status must be active or inactive");if(actor.equals(user)&&status.equals("inactive"))throw new ApiException(HttpStatus.BAD_REQUEST,"You cannot deactivate your own account");boolean active=status.equals("active");db.update("UPDATE users SET is_active=:active,updated_at=NOW() WHERE id=:id",Map.of("id",user,"active",active));db.touchAudit(actor,"USER_STATUS_CHANGED","user",id,String.valueOf(body.getOrDefault("reason","")));return user(id);}
    @PutMapping("/users/{id}/roles") public ApiResponse<Map<String,Object>> userRoles(@PathVariable String id,@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId(),user=db.uuid(id);Object raw=body.get("roleIds");List<?> roleIds=raw instanceof List<?> l?l:List.of();db.update("DELETE FROM user_roles WHERE user_id=:id",Map.of("id",user));for(Object roleId:roleIds){UUID rid=null;long numeric;try{numeric=Long.parseLong(String.valueOf(roleId));}catch(Exception e){continue;}db.update("INSERT INTO user_roles(user_id,role_id) VALUES(:user,:role)",Map.of("user",user,"role",numeric));}db.touchAudit(actor,"USER_ROLES_CHANGED","user",id,"Admin replaced roles");return user(id);}

    @GetMapping("/courses") public ApiResponse<Map<String,Object>> courses(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(required=false)String search){
        String s=search==null||search.isBlank()?"":search.trim();PlatformJdbcService.Page p=db.page("SELECT c.id,c.title,c.category,c.level,c.description,c.status,c.approval_status,c.created_at,COALESCE(u.full_name,'') AS trainer_name FROM courses c LEFT JOIN users u ON u.id=c.trainer_id WHERE (:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%',:search,'%'))) ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM courses WHERE (:search = '' OR LOWER(title) LIKE LOWER(CONCAT('%',:search,'%')))",db.params("search",s),page,size);return ApiResponse.success(p.asMap());
    }
    @PostMapping("/courses") public ApiResponse<Map<String,Object>> createCourse(@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId(),id=UUID.randomUUID();db.update("INSERT INTO courses(id,title,category,level,description,status,approval_status,learning_outcomes,chapter_count,duration,certificate_eta) VALUES(:id,:title,:category,:level,:description,:status,:approval,'[]'::jsonb,0,'-','-')",Map.of("id",id,"title",body.getOrDefault("title","Untitled Course"),"category",body.getOrDefault("category","Soft Skills"),"level",body.getOrDefault("level","Beginner to Advanced"),"description",body.getOrDefault("description",""),"status",body.getOrDefault("status","draft"),"approval",body.getOrDefault("approvalStatus","approved")));db.touchAudit(actor,"COURSE_CREATED","course",id.toString(),String.valueOf(body.getOrDefault("title","")));return course(id.toString());}
    @PutMapping("/courses/{id}") public ApiResponse<Map<String,Object>> updateCourse(@PathVariable String id,@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId(),course=db.uuid(id);Map<String,Object> p=new LinkedHashMap<>();p.put("id",course);p.put("title",body.get("title"));p.put("category",body.get("category"));p.put("level",body.get("level"));p.put("description",body.get("description"));p.put("status",body.get("status"));db.update("UPDATE courses SET title=COALESCE(:title,title),category=COALESCE(:category,category),level=COALESCE(:level,level),description=COALESCE(:description,description),status=COALESCE(:status,status),updated_at=NOW() WHERE id=:id",p);db.touchAudit(actor,"COURSE_UPDATED","course",id,"Admin updated course");return course(id);}
    @DeleteMapping("/courses/{id}") public ApiResponse<Void> deleteCourse(@PathVariable String id){UUID actor=currentUser.getCurrentUserId();db.update("DELETE FROM courses WHERE id=:id",Map.of("id",db.uuid(id)));db.touchAudit(actor,"COURSE_DELETED","course",id,"Admin deleted course");return ApiResponse.success("Course deleted");}
    private ApiResponse<Map<String,Object>> course(String id){Map<String,Object> r=db.one("SELECT c.id,c.title,c.category,c.level,c.description,c.status,c.approval_status,c.created_at,COALESCE(u.full_name,'') trainer_name FROM courses c LEFT JOIN users u ON u.id=c.trainer_id WHERE c.id=:id",Map.of("id",db.uuid(id)));return r==null?ApiResponse.error("Course not found"):ApiResponse.success(r);}

    @GetMapping("/batches") public ApiResponse<Map<String,Object>> batches(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){PlatformJdbcService.Page p=db.page("SELECT b.id,b.name,COALESCE(c.title,'') course_title,COALESCE(u.full_name,'') trainer_name,COUNT(bs.student_id) student_count,b.start_date,b.end_date,b.status FROM batches b LEFT JOIN courses c ON c.id=b.course_id LEFT JOIN users u ON u.id=b.trainer_id LEFT JOIN batch_students bs ON bs.batch_id=b.id GROUP BY b.id,c.title,u.full_name ORDER BY b.start_date DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM batches",Map.of(),page,size);return ApiResponse.success(p.asMap());}
    @GetMapping("/batches/{id}") public ApiResponse<Map<String,Object>> batch(@PathVariable String id){Map<String,Object> r=db.one("SELECT b.*,c.title course_title,u.full_name trainer_name FROM batches b LEFT JOIN courses c ON c.id=b.course_id LEFT JOIN users u ON u.id=b.trainer_id WHERE b.id=:id",Map.of("id",db.uuid(id)));return r==null?ApiResponse.error("Batch not found"):ApiResponse.success(r);}

    @GetMapping("/course-approvals") public ApiResponse<Map<String,Object>> approvals(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){PlatformJdbcService.Page p=db.page("SELECT c.id,c.title,c.category,c.level,COALESCE(u.full_name,'') trainer_name,c.approval_status,c.created_at FROM courses c LEFT JOIN users u ON u.id=c.trainer_id WHERE c.approval_status='pending' ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM courses WHERE approval_status='pending'",Map.of(),page,size);return ApiResponse.success(p.asMap());}
    @PostMapping("/course-approvals/{id}/decision") public ApiResponse<Map<String,Object>> approvalDecision(@PathVariable String id,@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId();String decision=String.valueOf(body.getOrDefault("decision","reject")).toLowerCase();String status="approve".equals(decision)?"approved":"rejected";db.update("UPDATE courses SET approval_status=:status,status=CASE WHEN :status='approved' THEN 'published' ELSE 'draft' END,updated_at=NOW() WHERE id=:id",Map.of("id",db.uuid(id),"status",status));db.touchAudit(actor,"COURSE_APPROVAL_"+status.toUpperCase(),"course",id,String.valueOf(body.getOrDefault("reason","")));return course(id);}

    @GetMapping("/assessments") public ApiResponse<Map<String,Object>> assessments(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){PlatformJdbcService.Page p=db.page("SELECT a.id,a.title,a.type,a.status,a.due_at,a.duration_minutes,COALESCE(b.name,'') batch_name,COALESCE(u.full_name,'') trainer_name FROM assessments a LEFT JOIN batches b ON b.id=a.batch_id LEFT JOIN users u ON u.id=a.trainer_id ORDER BY a.due_at NULLS LAST LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM assessments",Map.of(),page,size);return ApiResponse.success(p.asMap());}
    @GetMapping("/assessments/{id}") public ApiResponse<Map<String,Object>> assessment(@PathVariable String id){Map<String,Object> r=db.one("SELECT a.*,COALESCE(b.name,'') batch_name,COALESCE(u.full_name,'') trainer_name FROM assessments a LEFT JOIN batches b ON b.id=a.batch_id LEFT JOIN users u ON u.id=a.trainer_id WHERE a.id=:id",Map.of("id",db.uuid(id)));return r==null?ApiResponse.error("Assessment not found"):ApiResponse.success(r);}

    @GetMapping("/appeals") public ApiResponse<Map<String,Object>> appeals(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(db.page("SELECT ap.id,ap.title,ap.reason,ap.status,ap.created_at,COALESCE(u.full_name,'') student_name FROM appeals ap LEFT JOIN users u ON u.id=ap.student_id ORDER BY ap.created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM appeals",Map.of(),page,size).asMap());}
    @PostMapping("/appeals/{id}/decision") public ApiResponse<Map<String,Object>> appeal(@PathVariable String id,@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId();String status=String.valueOf(body.getOrDefault("decision","reject")).equalsIgnoreCase("approve")?"approved":"rejected";db.update("UPDATE appeals SET status=:status,decision_reason=:reason,reviewed_at=NOW() WHERE id=:id",Map.of("id",db.uuid(id),"status",status,"reason",String.valueOf(body.getOrDefault("reason",""))));db.touchAudit(actor,"APPEAL_"+status.toUpperCase(),"appeal",id,String.valueOf(body.getOrDefault("reason","")));return ApiResponse.success(Map.of("status",status));}

    @GetMapping("/reports") public ApiResponse<Map<String,Object>> reports(){return ApiResponse.success(Map.of("generatedAt",OffsetDateTime.now(),"users",db.count("SELECT COUNT(*) FROM users",Map.of()),"courses",db.count("SELECT COUNT(*) FROM courses",Map.of()),"batches",db.count("SELECT COUNT(*) FROM batches",Map.of()),"enrollments",db.count("SELECT COUNT(*) FROM enrollments",Map.of()),"completedAssessments",db.count("SELECT COUNT(*) FROM assessment_attempts WHERE status='completed'",Map.of())));}
    @PostMapping(value="/reports/export",produces=MediaType.TEXT_PLAIN_VALUE) public String reportExport(@RequestBody Map<String,Object> body){return "metric,value\nusers,"+db.count("SELECT COUNT(*) FROM users",Map.of())+"\ncourses,"+db.count("SELECT COUNT(*) FROM courses",Map.of())+"\nbatches,"+db.count("SELECT COUNT(*) FROM batches",Map.of())+"\n";}

    @GetMapping("/finance") public ApiResponse<Map<String,Object>> finance(){return ApiResponse.success(Map.of("totalRevenue",db.count("SELECT COALESCE(SUM(amount),0)::bigint FROM transactions WHERE type='credit'",Map.of()),"refunds",db.count("SELECT COALESCE(SUM(amount),0)::bigint FROM transactions WHERE type='debit'",Map.of()),"transactionCount",db.count("SELECT COUNT(*) FROM transactions",Map.of())));}
    @GetMapping("/finance/transactions") public ApiResponse<Map<String,Object>> transactions(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(db.page("SELECT t.id,t.reference,t.type,t.amount,t.status,t.created_at,COALESCE(u.full_name,'') user_name FROM transactions t LEFT JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM transactions",Map.of(),page,size).asMap());}
    @GetMapping("/content") public ApiResponse<Map<String,Object>> content(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(db.page("SELECT id,title,slug,status,body,created_at,updated_at FROM content_items ORDER BY created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM content_items",Map.of(),page,size).asMap());}
    @PostMapping("/content") public ApiResponse<Map<String,Object>> createContent(@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId(),id=UUID.randomUUID();db.update("INSERT INTO content_items(id,title,slug,status,body,created_by) VALUES(:id,:title,:slug,'draft',:body,:actor)",Map.of("id",id,"title",body.getOrDefault("title","New Content"),"slug",body.getOrDefault("slug",id.toString()),"body",body.getOrDefault("body",""),"actor",actor));return ApiResponse.success(db.one("SELECT * FROM content_items WHERE id=:id",Map.of("id",id)));}
    @PutMapping("/content/{id}") public ApiResponse<Map<String,Object>> updateContent(@PathVariable String id,@RequestBody Map<String,Object> body){Map<String,Object> p=new LinkedHashMap<>();p.put("id",db.uuid(id));p.put("title",body.get("title"));p.put("slug",body.get("slug"));p.put("body",body.get("body"));p.put("status",body.get("status"));db.update("UPDATE content_items SET title=COALESCE(:title,title),slug=COALESCE(:slug,slug),body=COALESCE(:body,body),status=COALESCE(:status,status),updated_at=NOW() WHERE id=:id",p);return ApiResponse.success(db.one("SELECT * FROM content_items WHERE id=:id",Map.of("id",db.uuid(id))));}
    @DeleteMapping("/content/{id}") public ApiResponse<Void> deleteContent(@PathVariable String id){db.update("DELETE FROM content_items WHERE id=:id",Map.of("id",db.uuid(id)));return ApiResponse.success("Content deleted");}
    @GetMapping("/settings") public ApiResponse<Map<String,Object>> settings(){return ApiResponse.success(settingMap("organization"));}
    @PutMapping("/settings") public ApiResponse<Map<String,Object>> updateSettings(@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId();for(Map.Entry<String,Object> e:body.entrySet())upsertSetting("organization",e.getKey(),String.valueOf(e.getValue()));db.touchAudit(actor,"SETTINGS_UPDATED","settings","organization","Admin settings updated");return settings();}
    @GetMapping("/notifications") public ApiResponse<List<Map<String,Object>>> notifications(){return ApiResponse.success(db.list("SELECT id,title,body,created_at,read_flag AS read FROM notifications WHERE user_id=:id ORDER BY created_at DESC LIMIT 50",Map.of("id",currentUser.getCurrentUserId())));}
    private Map<String,Object> settingMap(String scope){Map<String,Object> out=new LinkedHashMap<>();for(Map<String,Object> r:db.list("SELECT setting_key,setting_value FROM settings WHERE scope=:scope ORDER BY setting_key",Map.of("scope",scope)))out.put(String.valueOf(r.get("setting_key")),r.get("setting_value"));return out;}
    private void upsertSetting(String scope,String key,String value){db.update("INSERT INTO settings(scope,setting_key,setting_value) VALUES(:scope,:key,:value) ON CONFLICT(scope,setting_key) DO UPDATE SET setting_value=:value,updated_at=NOW()",Map.of("scope",scope,"key",key,"value",value));}
}

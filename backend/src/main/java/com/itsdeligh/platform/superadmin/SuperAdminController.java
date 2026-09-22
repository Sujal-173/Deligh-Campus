package com.itsdeligh.platform.superadmin;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.itsdeligh.platform.common.api.ApiResponse;
import com.itsdeligh.platform.common.data.PlatformJdbcService;
import com.itsdeligh.platform.common.security.CurrentUserProvider;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/super-admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {
    private final PlatformJdbcService db;
    private final CurrentUserProvider currentUser;
    private final PasswordEncoder passwordEncoder;
    public SuperAdminController(PlatformJdbcService db, CurrentUserProvider currentUser, PasswordEncoder passwordEncoder){this.db=db;this.currentUser=currentUser;this.passwordEncoder=passwordEncoder;}

    @GetMapping("/dashboard") public ApiResponse<Map<String,Object>> dashboard(){return ApiResponse.success(Map.of("organizations",db.count("SELECT COUNT(*) FROM organizations",Map.of()),"admins",db.count("SELECT COUNT(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='ADMIN'",Map.of()),"students",db.count("SELECT COUNT(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='STUDENT'",Map.of()),"trainers",db.count("SELECT COUNT(*) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code='TRAINER'",Map.of()),"subscriptions",db.count("SELECT COUNT(*) FROM subscriptions",Map.of()),"auditEvents",db.count("SELECT COUNT(*) FROM audit_logs",Map.of())));}
    @GetMapping("/organizations") public ApiResponse<Map<String,Object>> organizations(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(db.page("SELECT id,name,code,status,created_at,updated_at FROM organizations ORDER BY created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM organizations",Map.of(),page,size).asMap());}
    @PostMapping("/organizations") public ApiResponse<Map<String,Object>> createOrg(@RequestBody Map<String,Object> body){UUID actor=currentUser.getCurrentUserId(),id=UUID.randomUUID();db.update("INSERT INTO organizations(id,name,code,status) VALUES(:id,:name,:code,'active')",Map.of("id",id,"name",body.getOrDefault("name","New Organization"),"code",body.getOrDefault("code","ORG-"+id.toString().substring(0,8))));db.touchAudit(actor,"ORGANIZATION_CREATED","organization",id.toString(),String.valueOf(body.getOrDefault("name","")));return organization(id.toString());}
    @GetMapping("/organizations/{id}") public ApiResponse<Map<String,Object>> organization(@PathVariable String id){Map<String,Object> r=db.one("SELECT * FROM organizations WHERE id=:id",Map.of("id",db.uuid(id)));return r==null?ApiResponse.error("Organization not found"):ApiResponse.success(r);}
    @PutMapping("/organizations/{id}") public ApiResponse<Map<String,Object>> updateOrg(@PathVariable String id,@RequestBody Map<String,Object> body){Map<String,Object> p=new LinkedHashMap<>();p.put("id",db.uuid(id));p.put("name",body.get("name"));p.put("code",body.get("code"));db.update("UPDATE organizations SET name=COALESCE(:name,name),code=COALESCE(:code,code),updated_at=NOW() WHERE id=:id",p);return organization(id);}
    @PatchMapping("/organizations/{id}/status") public ApiResponse<Map<String,Object>> orgStatus(@PathVariable String id,@RequestBody Map<String,Object> body){db.update("UPDATE organizations SET status=:status,updated_at=NOW() WHERE id=:id",Map.of("id",db.uuid(id),"status",String.valueOf(body.getOrDefault("status","active")).toLowerCase()));return organization(id);}

    @GetMapping("/roles") public ApiResponse<List<Map<String,Object>>> roles(){return ApiResponse.success(db.list("SELECT id,code,name,description,is_system_role,created_at,updated_at FROM roles ORDER BY code",Map.of()));}
    @PostMapping("/roles") public ApiResponse<Map<String,Object>> createRole(@RequestBody Map<String,Object> body){String code=String.valueOf(body.getOrDefault("code","CUSTOM_"+UUID.randomUUID().toString().substring(0,8))).trim().toUpperCase();db.update("INSERT INTO roles(code,name,description,is_system_role) VALUES(:code,:name,:description,FALSE)",Map.of("code",code,"name",body.getOrDefault("name","Custom Role"),"description",body.getOrDefault("description","")));return ApiResponse.success(db.one("SELECT * FROM roles WHERE code=:code",Map.of("code",code)));}
    @PutMapping("/roles/{id}") public ApiResponse<Map<String,Object>> updateRole(@PathVariable String id,@RequestBody Map<String,Object> body){long rid=Long.parseLong(id);Map<String,Object> p=new LinkedHashMap<>();p.put("id",rid);p.put("name",body.get("name"));p.put("description",body.get("description"));db.update("UPDATE roles SET name=COALESCE(:name,name),description=COALESCE(:description,description),updated_at=NOW() WHERE id=:id",p);return ApiResponse.success(db.one("SELECT * FROM roles WHERE id=:id",Map.of("id",rid)));}
    @DeleteMapping("/roles/{id}") public ApiResponse<Void> deleteRole(@PathVariable String id){db.update("DELETE FROM roles WHERE id=:id AND is_system_role=FALSE",Map.of("id",Long.parseLong(id)));return ApiResponse.success("Role deleted");}
    @GetMapping("/permissions") public ApiResponse<List<Map<String,Object>>> permissions(){return ApiResponse.success(db.list("SELECT id,code,name,description FROM permissions ORDER BY code",Map.of()));}
    @PutMapping("/roles/{id}/permissions") public ApiResponse<Map<String,Object>> rolePermissions(@PathVariable String id,@RequestBody Map<String,Object> body){long role=Long.parseLong(id);db.update("DELETE FROM role_permissions WHERE role_id=:role",Map.of("role",role));Object raw=body.get("permissionIds");if(raw instanceof List<?> list)for(Object v:list)db.update("INSERT INTO role_permissions(role_id,permission_id) VALUES(:role,:permission)",Map.of("role",role,"permission",Long.parseLong(String.valueOf(v))));return ApiResponse.success(Map.of("roleId",role,"updated",true));}

    @GetMapping("/admins") public ApiResponse<Map<String,Object>> admins(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(db.page("SELECT u.id,u.full_name,u.email,u.mobile,u.is_active,u.created_at FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code IN ('ADMIN','SUPER_ADMIN') ORDER BY u.created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(DISTINCT u.id) FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.code IN ('ADMIN','SUPER_ADMIN')",Map.of(),page,size).asMap());}
    @PostMapping("/admins") public ApiResponse<Map<String,Object>> createAdmin(@RequestBody Map<String,Object> body){
        String email=String.valueOf(body.getOrDefault("email","")).trim().toLowerCase();
        String password=String.valueOf(body.getOrDefault("password",""));
        String name=String.valueOf(body.getOrDefault("fullName","Administrator"));
        if(email.isBlank()||password.length()<8)return ApiResponse.error("Email and a password of at least 8 characters are required");
        if(db.count("SELECT COUNT(*) FROM users WHERE LOWER(email)=LOWER(:email)",Map.of("email",email))>0)return ApiResponse.error("A user with that email already exists");
        UUID id=UUID.randomUUID();
        db.update("INSERT INTO users(id,full_name,email,password_hash,email_verified,is_active,is_locked,profile_complete) VALUES(:id,:name,:email,:hash,true,true,false,false)",Map.of("id",id,"name",name,"email",email,"hash",passwordEncoder.encode(password)));
        Map<String,Object> roleRow=db.one("SELECT id FROM roles WHERE code='ADMIN' LIMIT 1",Map.of());
        if(roleRow!=null)db.update("INSERT INTO user_roles(user_id,role_id) VALUES(:uid,:rid)",Map.of("uid",id,"rid",roleRow.get("id")));
        db.touchAudit(currentUser.getCurrentUserId(),"ADMIN_CREATED","user",id.toString(),email);
        return user(id.toString());
    }
    @PutMapping("/admins/{id}") public ApiResponse<Map<String,Object>> updateAdmin(@PathVariable String id,@RequestBody Map<String,Object> body){Map<String,Object> p=new LinkedHashMap<>();p.put("id",db.uuid(id));p.put("name",body.get("fullName"));p.put("mobile",body.get("mobile"));db.update("UPDATE users SET full_name=COALESCE(:name,full_name),mobile=COALESCE(:mobile,mobile),updated_at=NOW() WHERE id=:id",p);return user(id);}
    @PatchMapping("/admins/{id}/status") public ApiResponse<Map<String,Object>> adminStatus(@PathVariable String id,@RequestBody Map<String,Object> body){String status=String.valueOf(body.getOrDefault("status","active")).trim().toLowerCase();boolean active=!status.equals("inactive")&&!status.equals("disabled")&&!status.equals("suspended");db.update("UPDATE users SET is_active=:active,updated_at=NOW() WHERE id=:id",Map.of("id",db.uuid(id),"active",active));return user(id);}

    @GetMapping("/subscriptions") public ApiResponse<Map<String,Object>> subscriptions(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(db.page("SELECT s.id,s.organization_id,s.plan,s.status,s.started_at,s.ends_at FROM subscriptions s ORDER BY s.started_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM subscriptions",Map.of(),page,size).asMap());}
    @PutMapping("/subscriptions/{id}") public ApiResponse<Map<String,Object>> updateSubscription(@PathVariable String id,@RequestBody Map<String,Object> body){Map<String,Object> p=new LinkedHashMap<>();p.put("id",db.uuid(id));p.put("plan",body.get("plan"));p.put("status",body.get("status"));db.update("UPDATE subscriptions SET plan=COALESCE(:plan,plan),status=COALESCE(:status,status),updated_at=NOW() WHERE id=:id",p);return ApiResponse.success(db.one("SELECT * FROM subscriptions WHERE id=:id",Map.of("id",db.uuid(id))));}
    @GetMapping("/analytics") public ApiResponse<Map<String,Object>> analytics(){return ApiResponse.success(Map.of("usersByMonth",db.list("SELECT TO_CHAR(date_trunc('month',created_at),'YYYY-MM') month,COUNT(*) users FROM users WHERE created_at >= NOW() - INTERVAL '12 months' GROUP BY 1 ORDER BY 1",Map.of()),"organizations",db.count("SELECT COUNT(*) FROM organizations",Map.of()),"courses",db.count("SELECT COUNT(*) FROM courses",Map.of()),"activeEnrollments",db.count("SELECT COUNT(*) FROM enrollments WHERE status='active'",Map.of()),"completedEnrollments",db.count("SELECT COUNT(*) FROM enrollments WHERE status='completed'",Map.of())));}
    @GetMapping("/system-configuration") public ApiResponse<Map<String,Object>> system(){return ApiResponse.success(config("system"));}
    @PutMapping("/system-configuration") public ApiResponse<Map<String,Object>> updateSystem(@RequestBody Map<String,Object> body){for(var e:body.entrySet())upsert("system",e.getKey(),String.valueOf(e.getValue()));return system();}
    @GetMapping("/platform-configuration") public ApiResponse<Map<String,Object>> platform(){return ApiResponse.success(config("platform"));}
    @PutMapping("/platform-configuration") public ApiResponse<Map<String,Object>> updatePlatform(@RequestBody Map<String,Object> body){for(var e:body.entrySet())upsert("platform",e.getKey(),String.valueOf(e.getValue()));return platform();}
    @GetMapping("/audit-logs") public ApiResponse<Map<String,Object>> audit(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(db.page("SELECT al.id,al.action,al.resource_type,al.resource_id,al.details,al.created_at,COALESCE(u.full_name,'System') actor_name FROM audit_logs al LEFT JOIN users u ON u.id=al.actor_id ORDER BY al.created_at DESC LIMIT :limit OFFSET :offset","SELECT COUNT(*) FROM audit_logs",Map.of(),page,size).asMap());}
    private ApiResponse<Map<String,Object>> user(String id){Map<String,Object> r=db.one("SELECT id,full_name,email,mobile,is_active,is_locked FROM users WHERE id=:id",Map.of("id",db.uuid(id)));return r==null?ApiResponse.error("Admin not found"):ApiResponse.success(r);}
    @GetMapping("/notifications") public ApiResponse<List<Map<String,Object>>> notifications(){return ApiResponse.success(db.list("SELECT id,title,body,created_at,read_flag AS read FROM notifications WHERE user_id=:id ORDER BY created_at DESC LIMIT 50",Map.of("id",currentUser.getCurrentUserId())));}
    private Map<String,Object> config(String scope){Map<String,Object> out=new LinkedHashMap<>();for(Map<String,Object> r:db.list("SELECT setting_key,setting_value FROM settings WHERE scope=:scope ORDER BY setting_key",Map.of("scope",scope)))out.put(String.valueOf(r.get("setting_key")),r.get("setting_value"));return out;}
    private void upsert(String scope,String key,String value){db.update("INSERT INTO settings(scope,setting_key,setting_value) VALUES(:scope,:key,:value) ON CONFLICT(scope,setting_key) DO UPDATE SET setting_value=:value,updated_at=NOW()",Map.of("scope",scope,"key",key,"value",value));}
}

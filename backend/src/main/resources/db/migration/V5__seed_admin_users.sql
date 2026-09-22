-- ============================================================
-- Deligh Campus - Seed Admin Users
-- Flyway Migration: V5
-- ============================================================

-- Insert Super Admin User
INSERT INTO users (id, full_name, email, mobile, password_hash, email_verified, is_active, is_locked)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Super Admin',
    'superadmin@delighcampus.com',
    '9876543210',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: Admin@123
    TRUE,
    TRUE,
    FALSE
);

-- Insert Admin User
INSERT INTO users (id, full_name, email, mobile, password_hash, email_verified, is_active, is_locked)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Platform Admin',
    'admin@delighcampus.com',
    '9876543211',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: Admin@123
    TRUE,
    TRUE,
    FALSE
);

-- Assign Super Admin Role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'superadmin@delighcampus.com'
AND r.code = 'SUPER_ADMIN';

-- Assign Admin Role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@delighcampus.com'
AND r.code = 'ADMIN';

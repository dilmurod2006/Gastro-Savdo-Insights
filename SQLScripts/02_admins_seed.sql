-- =============================================================================
-- 02_admins_seed.sql
-- Gastro-Savdo-Insights uchun default admin foydalanuvchilari
-- =============================================================================
-- 
-- Bu fayl 2 ta default admin yaratadi:
-- 1. student - Talaba admin
-- 2. teacher - O'qituvchi admin
--
-- Eslatma: Parollar bcrypt bilan hash qilingan
-- Plain text parollar:
--   student: password1234
--   teacher: teacher1234
--
-- Bcrypt hash generation uchun Python:
--   import bcrypt
--   bcrypt.hashpw("password1234".encode(), bcrypt.gensalt(12)).decode()
-- =============================================================================

USE northwind;

-- Avval mavjud test adminlarni o'chirish (agar mavjud bo'lsa)
DELETE FROM admins WHERE username IN ('student', 'teacher', 'superadmin', 'manager');

-- =============================================================================
-- Admin 1: Student
-- Username: student
-- Password: password1234
-- Telegram 2FA: yoqilgan (telegram_id = 5420071824)
-- =============================================================================
INSERT INTO admins (
    username,
    password_hash,
    first_name,
    last_name,
    telegram_id,
    phone_number,
    created_at,
    updated_at
) VALUES (
    'student',
    '$2b$12$R2Nvplv3wkgfCRhmVgakHOoN0XT0vFoXdwSzMPYPpfiS.KPhZZstC',  -- password1234
    'Talaba',
    'Admin',
    '5420071824',  -- 2FA yoqilgan
    '+998901234567',
    NOW(),
    NOW()
);

-- =============================================================================
-- Admin 2: Teacher
-- Username: teacher
-- Password: teacher1234
-- Telegram 2FA: yoqilgan (telegram_id = 1321774812)
-- =============================================================================
INSERT INTO admins (
    username,
    password_hash,
    first_name,
    last_name,
    telegram_id,
    phone_number,
    created_at,
    updated_at
) VALUES (
    'teacher',
    '$2b$12$TBT/.WNDZ2sBVjKzej9/DOoPJmgZvPLntKNR9WBzcroYkrqEkzkoG',  -- teacher1234
    'Oqituvchi',
    'Admin',
    '1321774812',  -- 2FA yoqilgan
    '+998907654321',
    NOW(),
    NOW()
);

-- =============================================================================
-- Tekshirish uchun SELECT
-- =============================================================================
SELECT 
    adminId,
    username,
    CONCAT(first_name, ' ', last_name) AS full_name,
    CASE 
        WHEN telegram_id IS NOT NULL THEN 'Yoqilgan'
        ELSE 'O\'chirilgan'
    END AS '2FA_status',
    phone_number,
    created_at
FROM admins
WHERE username IN ('student', 'teacher');

-- =============================================================================
-- Eslatmalar:
-- 
-- 1. Parol hash'larni qayta generatsiya qilish uchun:
--    Python: 
--    >>> import bcrypt
--    >>> bcrypt.hashpw("YourPassword123!".encode(), bcrypt.gensalt(12)).decode()
--
-- 2. 2FA o'chirish uchun telegram_id maydonini NULL qiling:
--    UPDATE admins SET telegram_id = NULL WHERE username = 'student';
--
-- 3. Telegram chat_id olish uchun:
--    - Bot bilan suhbat boshlang
--    - /start yuboring
--    - Bot sizga chat_id ni ko'rsatadi
-- =============================================================================

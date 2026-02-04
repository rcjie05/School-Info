-- School Info System Database Schema
-- Run this in phpMyAdmin or MySQL to create all necessary tables

CREATE DATABASE IF NOT EXISTS school_info_db;
USE school_info_db;

-- Users Table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role ENUM('student', 'teacher', 'registrar', 'admin') NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_number VARCHAR(50) UNIQUE NOT NULL,
    program VARCHAR(100),
    year_level ENUM('1', '2', '3', '4', '5') NOT NULL,
    section VARCHAR(50),
    enrollment_status ENUM('enrolled', 'not_enrolled', 'pending') DEFAULT 'pending',
    payment_status ENUM('paid', 'partial', 'unpaid') DEFAULT 'unpaid',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    office_room VARCHAR(50),
    office_building VARCHAR(100),
    office_hours TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    building VARCHAR(100),
    room_number VARCHAR(50),
    contact_number VARCHAR(50),
    email VARCHAR(150),
    description TEXT
);

-- Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    floors INT NOT NULL,
    description TEXT,
    has_elevator BOOLEAN DEFAULT FALSE,
    has_ramp BOOLEAN DEFAULT FALSE
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    room_type ENUM('classroom', 'laboratory', 'office', 'faculty', 'department', 'other') NOT NULL,
    capacity INT,
    has_ac BOOLEAN DEFAULT FALSE,
    has_projector BOOLEAN DEFAULT FALSE,
    is_accessible BOOLEAN DEFAULT TRUE,
    description TEXT,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_room (building_id, room_number)
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    units INT NOT NULL,
    description TEXT
);

-- Class Schedules Table
CREATE TABLE IF NOT EXISTS class_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    room_id INT NOT NULL,
    section VARCHAR(50),
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    semester ENUM('1', '2', 'summer') NOT NULL,
    school_year VARCHAR(20) NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Student Enrollments (Study Load)
CREATE TABLE IF NOT EXISTS student_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_schedule_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('enrolled', 'dropped', 'completed') DEFAULT 'enrolled',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_schedule_id) REFERENCES class_schedules(id) ON DELETE CASCADE
);

-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    midterm_grade DECIMAL(5,2),
    final_grade DECIMAL(5,2),
    remarks ENUM('passed', 'failed', 'incomplete', 'dropped') DEFAULT 'incomplete',
    graded_at TIMESTAMP NULL,
    FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id) ON DELETE CASCADE
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_by INT NOT NULL,
    target_audience ENUM('all', 'students', 'teachers', 'registrar') DEFAULT 'all',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Feedback/Inquiry System
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('question', 'complaint', 'suggestion', 'other') NOT NULL,
    status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
    response TEXT,
    responded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, email, role, full_name) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@school.edu', 'admin', 'System Administrator');

-- Sample Buildings
INSERT INTO buildings (name, code, floors, has_elevator, has_ramp) VALUES 
('Main Building', 'MB', 4, TRUE, TRUE),
('Science Building', 'SB', 3, FALSE, TRUE),
('Engineering Building', 'EB', 5, TRUE, TRUE),
('Library Building', 'LB', 2, TRUE, TRUE);

-- Sample Departments
INSERT INTO departments (name, code, building, room_number, email) VALUES 
('Computer Science', 'CS', 'Engineering Building', '301', 'cs@school.edu'),
('Mathematics', 'MATH', 'Main Building', '201', 'math@school.edu'),
('Physics', 'PHYS', 'Science Building', '101', 'physics@school.edu'),
('Registrar Office', 'REG', 'Main Building', '101', 'registrar@school.edu');

-- Sample Rooms
INSERT INTO rooms (building_id, room_number, floor, room_type, capacity, has_ac, has_projector) VALUES 
(1, '101', 1, 'classroom', 40, TRUE, TRUE),
(1, '102', 1, 'classroom', 40, TRUE, TRUE),
(1, '201', 2, 'classroom', 35, TRUE, TRUE),
(1, '301', 3, 'office', 10, TRUE, FALSE),
(2, '101', 1, 'laboratory', 30, TRUE, TRUE),
(2, '102', 1, 'laboratory', 30, TRUE, TRUE),
(3, '101', 1, 'classroom', 45, TRUE, TRUE),
(3, '201', 2, 'laboratory', 35, TRUE, TRUE),
(3, '301', 3, 'office', 8, TRUE, FALSE);

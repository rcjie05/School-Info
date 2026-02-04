<?php
session_start();
require_once '../config/database.php';

class Auth {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    public function login($username, $password) {
        $query = "SELECT u.*, 
                  CASE 
                    WHEN u.role = 'student' THEN s.student_number
                    WHEN u.role = 'teacher' THEN t.employee_number
                    ELSE NULL
                  END as identifier
                  FROM users u
                  LEFT JOIN students s ON u.id = s.user_id
                  LEFT JOIN teachers t ON u.id = t.user_id
                  WHERE u.username = :username AND u.status = 'active'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch();
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['full_name'] = $user['full_name'];
                $_SESSION['logged_in'] = true;
                return ['success' => true, 'role' => $user['role']];
            }
        }
        return ['success' => false, 'message' => 'Invalid credentials'];
    }

    public function logout() {
        session_destroy();
        return true;
    }

    public function isLoggedIn() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }

    public function getRole() {
        return $_SESSION['role'] ?? null;
    }

    public function checkAccess($allowedRoles) {
        if (!$this->isLoggedIn()) {
            return false;
        }
        return in_array($_SESSION['role'], $allowedRoles);
    }

    public function register($data) {
        try {
            // Insert into users table
            $query = "INSERT INTO users (username, password, email, role, full_name) 
                      VALUES (:username, :password, :email, :role, :full_name)";
            
            $stmt = $this->conn->prepare($query);
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
            
            $stmt->bindParam(':username', $data['username']);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':role', $data['role']);
            $stmt->bindParam(':full_name', $data['full_name']);
            
            if ($stmt->execute()) {
                $userId = $this->conn->lastInsertId();
                
                // Insert role-specific data
                if ($data['role'] == 'student') {
                    $query2 = "INSERT INTO students (user_id, student_number, program, year_level, section) 
                               VALUES (:user_id, :student_number, :program, :year_level, :section)";
                    $stmt2 = $this->conn->prepare($query2);
                    $stmt2->bindParam(':user_id', $userId);
                    $stmt2->bindParam(':student_number', $data['student_number']);
                    $stmt2->bindParam(':program', $data['program']);
                    $stmt2->bindParam(':year_level', $data['year_level']);
                    $stmt2->bindParam(':section', $data['section']);
                    $stmt2->execute();
                } elseif ($data['role'] == 'teacher') {
                    $query2 = "INSERT INTO teachers (user_id, employee_number, department, office_room, office_building) 
                               VALUES (:user_id, :employee_number, :department, :office_room, :office_building)";
                    $stmt2 = $this->conn->prepare($query2);
                    $stmt2->bindParam(':user_id', $userId);
                    $stmt2->bindParam(':employee_number', $data['employee_number']);
                    $stmt2->bindParam(':department', $data['department']);
                    $stmt2->bindParam(':office_room', $data['office_room']);
                    $stmt2->bindParam(':office_building', $data['office_building']);
                    $stmt2->execute();
                }
                
                return ['success' => true, 'message' => 'Registration successful'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
?>

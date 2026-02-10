<?php
/**
 * Authentication Class
 * Handles user authentication, registration, and session management
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../config/database.php';

class Auth {
    private $conn;
    private $db;

    /**
     * Constructor - Initialize database connection
     */
    public function __construct() {
        try {
            $this->db = new Database();
            $this->conn = $this->db->getConnection();
        } catch (Exception $e) {
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    /**
     * Login user
     * 
     * @param string $username
     * @param string $password
     * @return array Response with success status and user data
     */
    public function login($username, $password) {
        try {
            // Prepare query to get user with role-specific identifier
            $query = "SELECT u.*, 
                      CASE 
                        WHEN u.role = 'student' THEN s.student_number
                        WHEN u.role = 'teacher' THEN t.employee_number
                        WHEN u.role = 'registrar' THEN NULL
                        WHEN u.role = 'hr' THEN h.employee_number
                        ELSE NULL
                      END as identifier
                      FROM users u
                      LEFT JOIN students s ON u.id = s.user_id AND u.role = 'student'
                      LEFT JOIN teachers t ON u.id = t.user_id AND u.role = 'teacher'
                      LEFT JOIN hr_staff h ON u.id = h.user_id AND u.role = 'hr'
                      WHERE u.username = :username AND u.status = 'active'";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();

            // Check if user exists
            if ($stmt->rowCount() === 0) {
                return [
                    'success' => false,
                    'message' => 'Invalid username or password'
                ];
            }

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verify password
            if (!password_verify($password, $user['password'])) {
                return [
                    'success' => false,
                    'message' => 'Invalid username or password'
                ];
            }

            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['identifier'] = $user['identifier'];
            $_SESSION['logged_in'] = true;
            $_SESSION['login_time'] = time();

            return [
                'success' => true,
                'message' => 'Login successful',
                'role' => $user['role'],
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'full_name' => $user['full_name'],
                    'role' => $user['role']
                ]
            ];

        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Logout user and destroy session
     * 
     * @return bool Success status
     */
    public function logout() {
    try {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Unset all session variables
        $_SESSION = [];

        // Delete session cookie properly
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        // Destroy session
        session_destroy();

        return true;

    } catch (Exception $e) {
        return false;
    }
}

    /**
     * Check if user is logged in
     * 
     * @return bool
     */
    public function isLoggedIn() {
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }

    /**
     * Get current user's role
     * 
     * @return string|null
     */
    public function getRole() {
        return $_SESSION['role'] ?? null;
    }

    /**
     * Get current user's ID
     * 
     * @return int|null
     */
    public function getUserId() {
        return $_SESSION['user_id'] ?? null;
    }

    /**
     * Check if user has access based on allowed roles
     * 
     * @param array $allowedRoles
     * @return bool
     */
    public function checkAccess($allowedRoles) {
        if (!$this->isLoggedIn()) {
            return false;
        }
        return in_array($this->getRole(), $allowedRoles);
    }

    /**
     * Register new user
     * 
     * @param array $data User registration data
     * @return array Response with success status
     */
    public function register($data) {
        try {
            // Start transaction
            $this->conn->beginTransaction();

            // Check if username already exists
            $checkQuery = "SELECT id FROM users WHERE username = :username";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':username', $data['username']);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                $this->conn->rollBack();
                return [
                    'success' => false,
                    'message' => 'Username already exists'
                ];
            }

            // Check if email already exists
            $checkQuery = "SELECT id FROM users WHERE email = :email";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':email', $data['email']);
            $checkStmt->execute();

            if ($checkStmt->rowCount() > 0) {
                $this->conn->rollBack();
                return [
                    'success' => false,
                    'message' => 'Email already exists'
                ];
            }

            // Insert into users table
            $query = "INSERT INTO users (username, password, email, role, full_name, status) 
                      VALUES (:username, :password, :email, :role, :full_name, 'active')";

            $stmt = $this->conn->prepare($query);
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

            $stmt->bindParam(':username', $data['username']);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':role', $data['role']);
            $stmt->bindParam(':full_name', $data['full_name']);

            if (!$stmt->execute()) {
                $this->conn->rollBack();
                return [
                    'success' => false,
                    'message' => 'Failed to create user account'
                ];
            }

            $userId = $this->conn->lastInsertId();

            // Insert role-specific data
            $roleResult = $this->insertRoleSpecificData($userId, $data);
            
            if (!$roleResult) {
                $this->conn->rollBack();
                return [
                    'success' => false,
                    'message' => 'Failed to create role-specific data'
                ];
            }

            // Commit transaction
            $this->conn->commit();

            return [
                'success' => true,
                'message' => 'Registration successful',
                'user_id' => $userId
            ];

        } catch (PDOException $e) {
            // Rollback on error
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            return [
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Insert role-specific user data
     * 
     * @param int $userId
     * @param array $data
     * @return bool Success status
     */
    private function insertRoleSpecificData($userId, $data) {
        try {
            switch ($data['role']) {
                case 'student':
                    return $this->createStudentRecord($userId, $data);

                case 'teacher':
                    return $this->createTeacherRecord($userId, $data);

                case 'registrar':
                    // Registrar doesn't need additional table entry
                    return true;

                case 'hr':
                    return $this->createHRRecord($userId, $data);

                default:
                    return false;
            }
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Create student record
     */
    private function createStudentRecord($userId, $data) {
        $query = "INSERT INTO students (user_id, student_number, program, year_level, section) 
                  VALUES (:user_id, :student_number, :program, :year_level, :section)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':student_number', $data['student_number']);
        $stmt->bindParam(':program', $data['program']);
        $stmt->bindParam(':year_level', $data['year_level']);
        $stmt->bindParam(':section', $data['section']);

        return $stmt->execute();
    }

    /**
     * Create teacher record
     */
    private function createTeacherRecord($userId, $data) {
        $query = "INSERT INTO teachers (user_id, employee_number, department, office_room, office_building) 
                  VALUES (:user_id, :employee_number, :department, :office_room, :office_building)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':employee_number', $data['employee_number']);
        $stmt->bindParam(':department', $data['department']);
        
        $officeRoom = $data['office_room'] ?? null;
        $officeBuilding = $data['office_building'] ?? null;
        
        $stmt->bindParam(':office_room', $officeRoom);
        $stmt->bindParam(':office_building', $officeBuilding);

        return $stmt->execute();
    }

    /**
     * Create HR record
     */
    private function createHRRecord($userId, $data) {
        $query = "INSERT INTO hr_staff (user_id, employee_number, department, office_room, office_building, position) 
                  VALUES (:user_id, :employee_number, :department, :office_room, :office_building, :position)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->bindParam(':employee_number', $data['employee_number']);
        
        $department = $data['department'] ?? 'Human Resources';
        $stmt->bindParam(':department', $department);
        
        $officeRoom = $data['office_room'] ?? null;
        $officeBuilding = $data['office_building'] ?? null;
        
        $stmt->bindParam(':office_room', $officeRoom);
        $stmt->bindParam(':office_building', $officeBuilding);
        $stmt->bindParam(':position', $data['position']);

        return $stmt->execute();
    }
}
?>
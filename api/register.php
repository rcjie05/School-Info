<?php
/**
 * Registration API Endpoint
 * Handles new user registration with role-based validation
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../classes/Auth.php';

try {
    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed. Use POST'
        ]);
        exit;
    }

    // Get and decode input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate JSON
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON format'
        ]);
        exit;
    }

    // Validate required common fields
    $requiredFields = ['username', 'password', 'email', 'role', 'full_name'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Missing required field: {$field}"
            ]);
            exit;
        }
    }

    // Validate role
    $allowedRoles = ['student', 'teacher', 'registrar', 'hr'];
    if (!in_array($data['role'], $allowedRoles)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid role. Allowed: ' . implode(', ', $allowedRoles)
        ]);
        exit;
    }

    // Validate role-specific fields
    switch ($data['role']) {
        case 'student':
            $studentFields = ['student_number', 'program', 'year_level', 'section'];
            foreach ($studentFields as $field) {
                if (empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => "Missing student field: {$field}"
                    ]);
                    exit;
                }
            }
            break;

        case 'teacher':
            if (empty($data['employee_number']) || empty($data['department'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing teacher information: employee_number and department required'
                ]);
                exit;
            }
            break;

        case 'registrar':
            if (empty($data['employee_number'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing registrar information: employee_number required'
                ]);
                exit;
            }
            // Set default department for registrar
            $data['department'] = $data['department'] ?? 'Registrar Office';
            break;

        case 'hr':
            if (empty($data['employee_number']) || empty($data['position'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing HR information: employee_number and position required'
                ]);
                exit;
            }
            // Set default department for HR
            $data['department'] = $data['department'] ?? 'Human Resources';
            break;
    }

    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email format'
        ]);
        exit;
    }

    // Validate password strength (minimum 6 characters)
    if (strlen($data['password']) < 6) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Password must be at least 6 characters long'
        ]);
        exit;
    }

    // Sanitize input
    $data['username'] = trim($data['username']);
    $data['email'] = trim($data['email']);
    $data['full_name'] = trim($data['full_name']);

    // Attempt registration
    $auth = new Auth();
    $result = $auth->register($data);

    if ($result['success']) {
        http_response_code(201); // Created
    } else {
        http_response_code(400); // Bad Request
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Registration failed: ' . $e->getMessage()
    ]);
}
?>
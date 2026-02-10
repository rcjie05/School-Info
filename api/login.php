<?php
/**
 * Login API Endpoint
 * Handles user authentication
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

    // Validate required fields
    if (empty($data['username']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Username and password are required'
        ]);
        exit;
    }

    // Sanitize input
    $username = trim($data['username']);
    $password = $data['password'];

    // Attempt login
    $auth = new Auth();
    $result = $auth->login($username, $password);

    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(401);
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>
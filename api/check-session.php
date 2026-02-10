<?php
/**
 * Check Session API Endpoint
 * Verifies if user is logged in and returns session info
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../classes/Auth.php';

try {
    // Only allow GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed. Use GET'
        ]);
        exit;
    }

    $auth = new Auth();

    if ($auth->isLoggedIn()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['user_id'] ?? null,
                'username' => $_SESSION['username'] ?? null,
                'role' => $_SESSION['role'] ?? null,
                'full_name' => $_SESSION['full_name'] ?? null
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'logged_in' => false,
            'message' => 'Not logged in'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>
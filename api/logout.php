<?php
/**
 * Logout API Endpoint
 * Handles user session termination
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');               // Change to your frontend domain in production
header('Access-Control-Allow-Credentials: true');       // Very important for cookies/sessions
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

// Clear all session data
$_SESSION = [];

// Regenerate ID to prevent session fixation (good practice)
if (session_id()) {
    session_regenerate_id(true);
}

// Delete the session cookie
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

// Destroy the session
session_destroy();

// Optional: extra safety – unset any possible lingering session vars
if (isset($_COOKIE[session_name()])) {
    unset($_COOKIE[session_name()]);
    setcookie(session_name(), '', time() - 3600, '/');
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
exit;
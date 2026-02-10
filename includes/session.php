<?php
// Session Manager - Centralized session handling
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function isLoggedIn() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

function getUserRole() {
    return $_SESSION['role'] ?? null;
}

function getUserId() {
    return $_SESSION['user_id'] ?? null;
}

function getFullName() {
    return $_SESSION['full_name'] ?? null;
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: /index.html');
        exit();
    }
}

function requireRole($allowedRoles) {
    requireLogin();
    if (!in_array(getUserRole(), $allowedRoles)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit();
    }
}

function redirectToDashboard() {
    if (isLoggedIn()) {
        $role = getUserRole();
        header("Location: /dashboard-{$role}.php");
        exit();
    }
}
?>

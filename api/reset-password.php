<?php
/**
 * Reset Password API Endpoint
 * Validates token and updates password
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get input
    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('No data received');
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }

    // Validate required fields
    if (empty($data['token'])) {
        throw new Exception('Reset token is required');
    }
    
    if (empty($data['new_password'])) {
        throw new Exception('New password is required');
    }

    if (strlen($data['new_password']) < 6) {
        throw new Exception('Password must be at least 6 characters long');
    }

    $token = trim($data['token']);
    $newPassword = $data['new_password'];

    // Connect to database
    require_once '../config/database.php';
    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    // ────────────────────────────────────────────────
    // FIXED: Use UTC_TIMESTAMP() to match UTC creation time
    // ────────────────────────────────────────────────
    $stmt = $conn->prepare("
        SELECT pr.*, u.id as user_id, u.email, u.full_name 
        FROM password_resets pr
        INNER JOIN users u ON pr.user_id = u.id
        WHERE pr.token = :token 
        AND pr.used = FALSE 
        AND pr.expires_at > UTC_TIMESTAMP()
        LIMIT 1
    ");
    $stmt->execute([':token' => $token]);
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check if token is valid
    if (!$reset) {
        // More detailed check for better error message
        $stmt = $conn->prepare("SELECT * FROM password_resets WHERE token = :token LIMIT 1");
        $stmt->execute([':token' => $token]);
        $checkToken = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$checkToken) {
            throw new Exception('Invalid reset link. Please request a new password reset.');
        } elseif ($checkToken['used']) {
            throw new Exception('This reset link has already been used. Please request a new one.');
        } else {
            throw new Exception('This reset link has expired. Please request a new password reset.');
        }
    }

    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Start transaction
    $conn->beginTransaction();

    try {
        // Update password
        $stmt = $conn->prepare("UPDATE users SET password = :password WHERE id = :user_id");
        $result = $stmt->execute([
            ':password' => $hashedPassword,
            ':user_id' => $reset['user_id']
        ]);

        if (!$result) {
            throw new Exception('Failed to update password');
        }

        // Mark token as used
        $stmt = $conn->prepare("UPDATE password_resets SET used = TRUE WHERE id = :reset_id");
        $stmt->execute([':reset_id' => $reset['id']]);

        // Commit transaction
        $conn->commit();

        error_log("Password reset successful for: " . $reset['email']);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Your password has been reset successfully. You can now login with your new password.'
        ]);

    } catch (Exception $e) {
        $conn->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    error_log("Database error in reset-password: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred. Please try again later.'
    ]);
} catch (Exception $e) {
    error_log("Error in reset-password: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
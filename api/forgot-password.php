<?php
/**
 * Forgot Password API Endpoint
 * Handles password reset requests and sends reset email using PHPMailer
 */

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Load Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

    // Validate email
    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Valid email is required');
    }

    $email = trim($data['email']);

    // Connect to database
    require_once '../config/database.php';
    $db = new Database();
    $conn = $db->getConnection();

    if (!$conn) {
        throw new Exception('Database connection failed');
    }

    // Create password_resets table if not exists
    $createTableSQL = "CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    
    try {
        $conn->exec($createTableSQL);
    } catch (PDOException $e) {
        error_log("Table creation note: " . $e->getMessage());
    }

    // Find user by email
    $stmt = $conn->prepare("SELECT id, full_name, email FROM users WHERE email = :email AND status = 'active' LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Security: Always return success
    if (!$user) {
        error_log("Password reset requested for non-existent email: $email");
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'If an account exists with that email, a reset link has been sent'
        ]);
        exit;
    }

    // Generate secure token
    $token = bin2hex(random_bytes(32));

    // Expiration: 1 DAY (24 hours) in UTC
    $nowUTC = new DateTime('now', new DateTimeZone('UTC'));
    $expiresUTC = clone $nowUTC;
    $expiresUTC->modify('+1 day');  // ← changed to 1 day

    $createdAt = $nowUTC->format('Y-m-d H:i:s');
    $expiresAt = $expiresUTC->format('Y-m-d H:i:s');

    // Delete old unused tokens
    $stmt = $conn->prepare("DELETE FROM password_resets WHERE user_id = :user_id AND used = FALSE");
    $stmt->execute([':user_id' => $user['id']]);

    // Insert new token
    $stmt = $conn->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)");
    $stmt->execute([
        ':user_id'    => $user['id'],
        ':token'      => $token,
        ':expires_at' => $expiresAt
    ]);

    // Build reset URL
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $path = dirname(dirname($_SERVER['PHP_SELF']));
    $resetUrl = $protocol . '://' . $host . $path . '/reset-password.html?token=' . $token;

    // Send email
    $emailSent = sendResetEmail($user['email'], $user['full_name'], $resetUrl, $token);

    // Return success even if email failed (security)
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Password reset link has been sent to your email',
        'debug_info' => [                      // Remove this block in production!
            'email_sent'   => $emailSent,
            'reset_url'    => $resetUrl,
            'token'        => $token,
            'created_utc'  => $createdAt,
            'expires_utc'  => $expiresAt
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error. Please try again later.'
    ]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Send password reset email using PHPMailer + Gmail SMTP
 */
function sendResetEmail($to, $name, $resetUrl, $token) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'godzdemonz05@gmail.com';
        $mail->Password   = 'wfwbepzwydgydmaw';  // NO SPACES!
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('godzdemonz05@gmail.com', 'School Info System');
        $mail->addAddress($to, $name);

        $mail->isHTML(true);
        $mail->Subject = 'Password Reset - School Info System';
        
        $mail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .container { padding: 20px; background: #f9f9f9; border-radius: 8px; }
                .header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .button { display: inline-block; padding: 14px 32px; background: #3498db; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="container">
                <p>Hello <strong>' . htmlspecialchars($name) . '</strong>,</p>
                <p>We received a request to reset your password.</p>
                <p style="text-align: center;">
                    <a href="' . htmlspecialchars($resetUrl) . '" class="button">Reset Password</a>
                </p>
                <p>Or copy this link:</p>
                <p style="word-break: break-all; background: white; padding: 10px; border: 1px solid #ddd;">
                    ' . htmlspecialchars($resetUrl) . '
                </p>
                <div class="warning">
                    <strong>Important:</strong><br>
                    • This link expires in 24 hours<br>
                    • If you didn\'t request this, ignore this email<br>
                    • Never share this link
                </div>
            </div>
            <div class="footer">
                <p>School Info System © ' . date('Y') . '</p>
            </div>
        </body>
        </html>';

        $mail->AltBody = "Hello $name,\n\nClick here to reset your password: $resetUrl\n\nThis link expires in 24 hours.\n\nIf not requested, ignore this email.";

        $mail->send();
        error_log("PHPMailer: Email sent successfully to $to");
        return true;

    } catch (Exception $e) {
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false;
    }
}
?>
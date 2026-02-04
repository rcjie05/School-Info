<?php
// Test Database Connection
echo "<h2>Database Connection Test</h2>";

$host = "localhost";
$db_name = "school_info_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color: green;'>✅ SUCCESS! Database connection is working!</p>";
    
    // Test if users table exists
    $stmt = $conn->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "<p style='color: green;'>✅ Users table exists with {$count} user(s)</p>";
    
    // Check if admin user exists
    $stmt = $conn->prepare("SELECT username, role FROM users WHERE username = 'admin'");
    $stmt->execute();
    if ($stmt->rowCount() > 0) {
        $admin = $stmt->fetch();
        echo "<p style='color: green;'>✅ Admin user found! Username: {$admin['username']}, Role: {$admin['role']}</p>";
    } else {
        echo "<p style='color: red;'>❌ Admin user NOT found! Please import the database schema.</p>";
    }
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ Connection Error: " . $e->getMessage() . "</p>";
    echo "<br><h3>Troubleshooting Steps:</h3>";
    echo "<ol>";
    echo "<li>Make sure XAMPP MySQL is running (check XAMPP Control Panel)</li>";
    echo "<li>Open phpMyAdmin: <a href='http://localhost/phpmyadmin'>http://localhost/phpmyadmin</a></li>";
    echo "<li>Create database named exactly: <strong>school_info_db</strong></li>";
    echo "<li>Import the file: <strong>database/schema.sql</strong></li>";
    echo "</ol>";
}
?>

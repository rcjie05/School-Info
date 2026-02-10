<?php
/**
 * User Account Checker
 * Access at: http://localhost/school_info/check_users.php
 */

echo "<h1>User Account Checker</h1>";
echo "<hr>";

$host = "localhost";
$db_name = "school_info_db";
$username = "root";
$password = ""; // Change if your MySQL has a password

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>✓ Database Connected</h2>";
    
    // Check all users
    echo "<hr><h2>All Users in Database:</h2>";
    $stmt = $conn->query("SELECT id, username, email, role, full_name, status, created_at FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
        echo "<tr style='background: #f0f0f0;'>";
        echo "<th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Full Name</th><th>Status</th><th>Created</th>";
        echo "</tr>";
        
        foreach ($users as $user) {
            $rowStyle = $user['username'] === 'admin' ? "background: #d4edda;" : "";
            echo "<tr style='$rowStyle'>";
            echo "<td>" . $user['id'] . "</td>";
            echo "<td><strong>" . $user['username'] . "</strong></td>";
            echo "<td>" . $user['email'] . "</td>";
            echo "<td>" . $user['role'] . "</td>";
            echo "<td>" . $user['full_name'] . "</td>";
            echo "<td>" . $user['status'] . "</td>";
            echo "<td>" . date('Y-m-d H:i', strtotime($user['created_at'])) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Check if admin exists
        echo "<hr><h2>Admin Account Check:</h2>";
        $adminStmt = $conn->query("SELECT * FROM users WHERE username = 'admin'");
        
        if ($adminStmt->rowCount() > 0) {
            $admin = $adminStmt->fetch();
            echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px;'>";
            echo "<h3 style='color: green;'>✓ Admin Account Exists!</h3>";
            echo "<p><strong>Username:</strong> admin</p>";
            echo "<p><strong>Email:</strong> " . $admin['email'] . "</p>";
            echo "<p><strong>Role:</strong> " . $admin['role'] . "</p>";
            echo "<p><strong>Status:</strong> " . $admin['status'] . "</p>";
            echo "<p><strong>Full Name:</strong> " . $admin['full_name'] . "</p>";
            
            // Test password
            $testPassword = 'admin123';
            if (password_verify($testPassword, $admin['password'])) {
                echo "<p style='color: green; font-weight: bold;'>✓ Password 'admin123' is CORRECT</p>";
                echo "<div style='background: #fff3cd; padding: 10px; margin-top: 10px; border-left: 4px solid #ffc107;'>";
                echo "<strong>LOGIN CREDENTIALS:</strong><br>";
                echo "Username: <code>admin</code><br>";
                echo "Password: <code>admin123</code>";
                echo "</div>";
            } else {
                echo "<p style='color: red; font-weight: bold;'>✗ Password 'admin123' is WRONG</p>";
                echo "<p>The password hash in database doesn't match 'admin123'</p>";
                echo "<p><strong>ACTION NEEDED:</strong> Reset the admin password (see below)</p>";
            }
            echo "</div>";
            
        } else {
            echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px;'>";
            echo "<h3 style='color: red;'>✗ Admin Account NOT Found!</h3>";
            echo "<p>No user with username 'admin' exists in the database.</p>";
            echo "<p><strong>This is the problem!</strong></p>";
            echo "</div>";
        }
        
    } else {
        echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px;'>";
        echo "<h3 style='color: red;'>✗ No Users Found!</h3>";
        echo "<p>The users table is empty. The database schema was not properly imported.</p>";
        echo "</div>";
    }
    
} catch(PDOException $e) {
    echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px;'>";
    echo "<h3 style='color: red;'>✗ Database Error</h3>";
    echo "<p>" . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "<hr>";
echo "<h2>🔧 Need to Create/Reset Admin Account?</h2>";
echo "<p>If admin account is missing or password is wrong, use this SQL:</p>";
echo "<div style='background: #f0f0f0; padding: 15px; font-family: monospace; overflow-x: auto;'>";
echo "<pre>";
echo "-- Delete old admin if exists
DELETE FROM users WHERE username = 'admin';

-- Create new admin user (password: admin123)
INSERT INTO users (username, password, email, role, full_name, status) 
VALUES (
    'admin', 
    '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'admin@school.edu', 
    'admin', 
    'System Administrator', 
    'active'
);";
echo "</pre>";
echo "</div>";

echo "<p><strong>How to run this SQL:</strong></p>";
echo "<ol>";
echo "<li>Go to phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
echo "<li>Click on 'school_info_db' database on the left</li>";
echo "<li>Click 'SQL' tab at the top</li>";
echo "<li>Copy and paste the SQL above</li>";
echo "<li>Click 'Go' button</li>";
echo "<li>Refresh this page to verify</li>";
echo "</ol>";

echo "<hr>";
echo "<h2>🔧 Create Additional Test Users?</h2>";
echo "<div style='background: #f0f0f0; padding: 15px; font-family: monospace; overflow-x: auto;'>";
echo "<pre>";
echo "-- Create a test student (username: student1, password: student123)
INSERT INTO users (username, password, email, role, full_name, status) 
VALUES ('student1', '\$2y\$10\$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'student1@school.edu', 'student', 'Test Student', 'active');

INSERT INTO students (user_id, student_number, program, year_level, section) 
VALUES (LAST_INSERT_ID(), 'S2024001', 'Computer Science', '1', 'A');

-- Create a test teacher (username: teacher1, password: teacher123)
INSERT INTO users (username, password, email, role, full_name, status) 
VALUES ('teacher1', '\$2y\$10\$ysGk8h1gMzZrNqQJzDtOqeXCPJYGOqJpJHLN5V3P7IXSdqhprJJfi', 'teacher1@school.edu', 'teacher', 'Test Teacher', 'active');

INSERT INTO teachers (user_id, employee_number, department, office_room, office_building) 
VALUES (LAST_INSERT_ID(), 'T2024001', 'Computer Science', '301', 'Engineering Building');

-- Create a test HR user (username: hr1, password: hr123)
INSERT INTO users (username, password, email, role, full_name, status) 
VALUES ('hr1', '\$2y\$10\$HfzIhGCCaxqyaJeHQ1QTBewWgrJ1hQ7GJ.SJkxKdJ3aF1nMpJcunm', 'hr1@school.edu', 'hr', 'Test HR Staff', 'active');

INSERT INTO hr_staff (user_id, employee_number, department, office_room, office_building, position) 
VALUES (LAST_INSERT_ID(), 'HR2024001', 'Human Resources', '201', 'Main Building', 'HR Manager');
";
echo "</pre>";
echo "</div>";

echo "<hr>";
echo "<p style='text-align: center;'>";
echo "<a href='index.html' style='display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Go to Login Page</a>";
echo "</p>";
?>

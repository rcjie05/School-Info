<?php
/**
 * Database Connection Test
 * Access this file at: http://localhost/school_info/test_db.php
 */

echo "<h1>Database Connection Test</h1>";
echo "<hr>";

// Test 1: PHP Version
echo "<h2>✓ Test 1: PHP Version</h2>";
echo "PHP Version: " . phpversion() . "<br>";
if (version_compare(phpversion(), '7.4.0', '>=')) {
    echo "<span style='color: green;'>✓ PHP version is compatible</span><br>";
} else {
    echo "<span style='color: red;'>✗ PHP version is too old (need 7.4+)</span><br>";
}

// Test 2: PDO Extension
echo "<hr><h2>✓ Test 2: PDO Extension</h2>";
if (extension_loaded('pdo_mysql')) {
    echo "<span style='color: green;'>✓ PDO MySQL extension is loaded</span><br>";
} else {
    echo "<span style='color: red;'>✗ PDO MySQL extension is NOT loaded</span><br>";
    die("Please enable PDO MySQL in php.ini");
}

// Test 3: Database Connection
echo "<hr><h2>✓ Test 3: Database Connection</h2>";

$host = "localhost";
$db_name = "school_info_db";
$username = "root";
$password = ""; // Change this if your MySQL has a password

try {
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<span style='color: green;'>✓ MySQL server connection successful</span><br>";
    
    // Test 4: Database Exists
    echo "<hr><h2>✓ Test 4: Database Exists</h2>";
    $stmt = $conn->query("SHOW DATABASES LIKE '$db_name'");
    if ($stmt->rowCount() > 0) {
        echo "<span style='color: green;'>✓ Database '$db_name' exists</span><br>";
        
        // Connect to specific database
        $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Test 5: Check Tables
        echo "<hr><h2>✓ Test 5: Database Tables</h2>";
        $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        $required_tables = ['users', 'students', 'teachers', 'hr_staff', 'buildings', 'rooms'];
        $missing_tables = [];
        
        echo "Found tables:<br>";
        foreach ($tables as $table) {
            echo "- $table<br>";
        }
        
        foreach ($required_tables as $table) {
            if (!in_array($table, $tables)) {
                $missing_tables[] = $table;
            }
        }
        
        if (empty($missing_tables)) {
            echo "<br><span style='color: green;'>✓ All required tables exist</span><br>";
            
            // Test 6: Check Admin User
            echo "<hr><h2>✓ Test 6: Admin User</h2>";
            $stmt = $conn->query("SELECT * FROM users WHERE username = 'admin'");
            if ($stmt->rowCount() > 0) {
                $admin = $stmt->fetch();
                echo "<span style='color: green;'>✓ Admin user exists</span><br>";
                echo "Username: " . $admin['username'] . "<br>";
                echo "Email: " . $admin['email'] . "<br>";
                echo "Role: " . $admin['role'] . "<br>";
            } else {
                echo "<span style='color: orange;'>⚠ Admin user not found - you need to import the schema</span><br>";
            }
            
            echo "<hr><h2 style='color: green;'>🎉 SUCCESS! Database is properly configured</h2>";
            echo "<p><a href='index.html'>Go to Login Page</a></p>";
            
        } else {
            echo "<br><span style='color: red;'>✗ Missing tables: " . implode(', ', $missing_tables) . "</span><br>";
            echo "<p><strong>ACTION REQUIRED:</strong> Import the database schema file (database/schema.sql) in phpMyAdmin</p>";
        }
        
    } else {
        echo "<span style='color: red;'>✗ Database '$db_name' does NOT exist</span><br>";
        echo "<p><strong>ACTION REQUIRED:</strong></p>";
        echo "<ol>";
        echo "<li>Open phpMyAdmin: <a href='http://localhost/phpmyadmin' target='_blank'>http://localhost/phpmyadmin</a></li>";
        echo "<li>Import the file: database/schema.sql</li>";
        echo "<li>Refresh this page</li>";
        echo "</ol>";
    }
    
} catch(PDOException $e) {
    echo "<span style='color: red;'>✗ Connection failed: " . $e->getMessage() . "</span><br>";
    echo "<p><strong>POSSIBLE CAUSES:</strong></p>";
    echo "<ul>";
    echo "<li>MySQL is not running - Start it in XAMPP Control Panel</li>";
    echo "<li>Wrong password - Check config/database.php</li>";
    echo "<li>Wrong port - Default is 3306</li>";
    echo "</ul>";
}

echo "<hr>";
echo "<p><small>File location: " . __FILE__ . "</small></p>";
?>

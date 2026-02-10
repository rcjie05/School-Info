<?php
require_once 'includes/session.php';
requireRole(['teacher']);

$fullName = getFullName();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teacher Dashboard - School Info System</title>
    <link rel="stylesheet" href="css/dashboard-teacher.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <img src="images/scclogo.png" alt="School Logo">
                <h1>Teacher Dashboard</h1>
            </div>
            <div class="user-info">
                <span>👤 <?php echo htmlspecialchars($fullName); ?></span>
                <a href="#" onclick="logout(); return false;" class="btn-logout">Logout</a>
            </div>
        </header>

        <nav class="sidebar">
            <ul>
                <li><a href="#" class="active">📊 Dashboard</a></li>
                <li><a href="floorplan.php">🗺️ Floor Plan Navigator</a></li>
                <li><a href="#schedule">📅 My Schedule</a></li>
                <li><a href="#classes">📚 My Classes</a></li>
                <li><a href="#grades">✏️ Grade Management</a></li>
                <li><a href="#students">👥 Student List</a></li>
                <li><a href="#profile">👤 My Profile</a></li>
            </ul>
        </nav>

        <main class="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($fullName); ?>!</h2>
            
            <div class="info-cards">
                <div class="info-card">
                    <h3>Teacher Information</h3>
                    <p><strong>Employee Number:</strong> <span id="employeeNumber">-</span></p>
                    <p><strong>Department:</strong> <span id="department">-</span></p>
                    <p><strong>Office:</strong> <span id="office">-</span></p>
                </div>

                <div class="info-card">
                    <h3>Teaching Load</h3>
                    <p><strong>Total Classes:</strong> <span id="totalClasses">-</span></p>
                    <p><strong>Total Students:</strong> <span id="totalStudents">-</span></p>
                </div>
            </div>

            <div class="quick-links">
                <h3>Quick Links</h3>
                <div class="link-grid">
                    <a href="floorplan.php" class="quick-link-card">
                        <span class="icon">🗺️</span>
                        <span>View Floor Plan</span>
                    </a>
                    <a href="#schedule" class="quick-link-card">
                        <span class="icon">📅</span>
                        <span>Class Schedule</span>
                    </a>
                    <a href="#grades" class="quick-link-card">
                        <span class="icon">✏️</span>
                        <span>Enter Grades</span>
                    </a>
                    <a href="#students" class="quick-link-card">
                        <span class="icon">👥</span>
                        <span>View Students</span>
                    </a>
                </div>
            </div>

            <div class="upcoming-classes">
                <h3>📅 Today's Schedule</h3>
                <div id="todaySchedule">
                    <p>Loading schedule...</p>
                </div>
            </div>
        </main>
    </div>

    <script src="js/dashboard-teacher.js"></script>
</body>
</html>

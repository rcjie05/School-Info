<?php
require_once 'includes/session.php';
requireRole(['student']);

$fullName = getFullName();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Dashboard - School Info System</title>
    <link rel="stylesheet" href="css/dashboard-student.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <img src="images/scclogo.png" alt="School Logo">
                <h1>Student Dashboard</h1>
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
                <li><a href="#grades">📚 My Grades</a></li>
                <li><a href="#enrollment">📝 Enrollment</a></li>
                <li><a href="#payments">💳 Payments</a></li>
                <li><a href="#profile">👤 My Profile</a></li>
            </ul>
        </nav>

        <main class="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($fullName); ?>!</h2>
            
            <div class="info-cards">
                <div class="info-card">
                    <h3>Student Information</h3>
                    <p><strong>Student Number:</strong> <span id="studentNumber">-</span></p>
                    <p><strong>Program:</strong> <span id="program">-</span></p>
                    <p><strong>Year Level:</strong> <span id="yearLevel">-</span></p>
                    <p><strong>Section:</strong> <span id="section">-</span></p>
                </div>

                <div class="info-card">
                    <h3>Enrollment Status</h3>
                    <p><strong>Status:</strong> <span id="enrollmentStatus">-</span></p>
                    <p><strong>Payment Status:</strong> <span id="paymentStatus">-</span></p>
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
                        <span class="icon">📊</span>
                        <span>View Grades</span>
                    </a>
                    <a href="#profile" class="quick-link-card">
                        <span class="icon">👤</span>
                        <span>Edit Profile</span>
                    </a>
                </div>
            </div>

            <div class="announcements">
                <h3>📢 Announcements</h3>
                <div id="announcementsList">
                    <p>Loading announcements...</p>
                </div>
            </div>
        </main>
    </div>

    <script src="js/dashboard-student.js"></script>
</body>
</html>

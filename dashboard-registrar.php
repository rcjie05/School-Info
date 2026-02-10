<?php
require_once 'includes/session.php';
requireRole(['registrar']);

$fullName = getFullName();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrar Dashboard - School Info System</title>
    <link rel="stylesheet" href="css/dashboard-registrar.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <img src="images/scclogo.png" alt="School Logo">
                <h1>Registrar Dashboard</h1>
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
                <li><a href="#students">👥 Student Records</a></li>
                <li><a href="#enrollment">📝 Enrollment</a></li>
                <li><a href="#grades">📊 Grades Management</a></li>
                <li><a href="#documents">📄 Documents</a></li>
                <li><a href="#reports">📈 Reports</a></li>
                <li><a href="#profile">👤 My Profile</a></li>
            </ul>
        </nav>

        <main class="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($fullName); ?>!</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🎓</div>
                    <div class="stat-info">
                        <h3>Total Students</h3>
                        <p class="stat-value" id="totalStudents">-</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                        <h3>Enrolled</h3>
                        <p class="stat-value" id="enrolledStudents">-</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-info">
                        <h3>Pending</h3>
                        <p class="stat-value" id="pendingEnrollments">-</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <div class="stat-info">
                        <h3>Documents</h3>
                        <p class="stat-value" id="pendingDocuments">-</p>
                    </div>
                </div>
            </div>

            <div class="quick-links">
                <h3>Quick Actions</h3>
                <div class="link-grid">
                    <a href="floorplan.php" class="quick-link-card">
                        <span class="icon">🗺️</span>
                        <span>View Floor Plan</span>
                    </a>
                    <a href="#students" class="quick-link-card">
                        <span class="icon">👥</span>
                        <span>Student Records</span>
                    </a>
                    <a href="#enrollment" class="quick-link-card">
                        <span class="icon">📝</span>
                        <span>Process Enrollment</span>
                    </a>
                    <a href="#grades" class="quick-link-card">
                        <span class="icon">📊</span>
                        <span>Manage Grades</span>
                    </a>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Recent Enrollment Requests</h3>
                <div id="recentEnrollments">
                    <p>Loading...</p>
                </div>
            </div>
        </main>
    </div>

    <script src="js/dashboard-registrar.js"></script>
</body>
</html>

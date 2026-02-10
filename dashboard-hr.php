<?php
require_once 'includes/session.php';
requireRole(['hr']);

$fullName = getFullName();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HR Dashboard - School Info System</title>
    <link rel="stylesheet" href="css/dashboard-hr.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <img src="images/scclogo.png" alt="School Logo">
                <h1>HR Dashboard</h1>
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
                <li><a href="#employees">👥 Employee Management</a></li>
                <li><a href="#recruitment">📝 Recruitment</a></li>
                <li><a href="#attendance">📅 Attendance</a></li>
                <li><a href="#payroll">💰 Payroll</a></li>
                <li><a href="#reports">📈 HR Reports</a></li>
                <li><a href="#profile">👤 My Profile</a></li>
            </ul>
        </nav>

        <main class="main-content">
            <h2>Welcome, <?php echo htmlspecialchars($fullName); ?>!</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>Total Employees</h3>
                        <p class="stat-value" id="totalEmployees">-</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👨‍🏫</div>
                    <div class="stat-info">
                        <h3>Teachers</h3>
                        <p class="stat-value" id="totalTeachers">-</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💼</div>
                    <div class="stat-info">
                        <h3>Staff</h3>
                        <p class="stat-value" id="totalStaff">-</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-info">
                        <h3>Pending Applications</h3>
                        <p class="stat-value" id="pendingApplications">-</p>
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
                    <a href="#employees" class="quick-link-card">
                        <span class="icon">👥</span>
                        <span>Manage Employees</span>
                    </a>
                    <a href="#recruitment" class="quick-link-card">
                        <span class="icon">📝</span>
                        <span>View Applications</span>
                    </a>
                    <a href="#reports" class="quick-link-card">
                        <span class="icon">📈</span>
                        <span>Generate Reports</span>
                    </a>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Recent HR Activities</h3>
                <div id="recentActivities">
                    <p>Loading...</p>
                </div>
            </div>
        </main>
    </div>

    <script src="js/dashboard-hr.js"></script>
</body>
</html>

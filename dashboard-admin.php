<?php
require_once 'includes/session.php';
requireRole(['admin']);

$fullName = getFullName();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - School Info System</title>
    <link rel="stylesheet" href="css/dashboard-admin.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="logo">
                <img src="images/scclogo.png" alt="School Logo">
                <h1>Admin Dashboard</h1>
            </div>
            <div class="user-info">
                <span>👤 <?php echo htmlspecialchars($fullName); ?></span>
                <a href="#" onclick="logout(); return false;" class="btn-logout">Logout</a>
            </div>
        </header>

        <nav class="sidebar">
            <ul>
                <li><a href="#" class="active">📊 Dashboard</a></li>
                <li><a href="floorplan.php">🗺️ Floor Plan Manager</a></li>
                <li><a href="#users">👥 User Management</a></li>
                <li><a href="#students">🎓 Students</a></li>
                <li><a href="#teachers">👨‍🏫 Teachers</a></li>
                <li><a href="#hr">💼 HR Staff</a></li>
                <li><a href="#registrar">📋 Registrar</a></li>
                <li><a href="#buildings">🏢 Buildings & Rooms</a></li>
                <li><a href="#schedules">📅 Class Schedules</a></li>
                <li><a href="#reports">📈 Reports</a></li>
                <li><a href="#settings">⚙️ Settings</a></li>
            </ul>
        </nav>

        <main class="main-content">
            <h2>Welcome, Administrator!</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <h3>Total Users</h3>
                        <p class="stat-value" id="totalUsers">-</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎓</div>
                    <div class="stat-info">
                        <h3>Students</h3>
                        <p class="stat-value" id="totalStudents">-</p>
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
                    <div class="stat-icon">🏢</div>
                    <div class="stat-info">
                        <h3>Buildings</h3>
                        <p class="stat-value" id="totalBuildings">-</p>
                    </div>
                </div>
            </div>

            <div class="quick-actions">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="window.location.href='floorplan.php'">
                        🗺️ Manage Floor Plans
                    </button>
                    <button class="btn btn-primary">
                        ➕ Add New User
                    </button>
                    <button class="btn btn-primary">
                        📚 Add New Course
                    </button>
                    <button class="btn btn-primary">
                        🏢 Add New Room
                    </button>
                </div>
            </div>

            <div class="recent-activity">
                <h3>Recent Activity</h3>
                <div class="activity-list" id="recentActivity">
                    <p>Loading...</p>
                </div>
            </div>
        </main>
    </div>

    <script src="js/dashboard-admin.js"></script>
</body>
</html>

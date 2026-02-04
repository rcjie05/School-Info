/* ============================================================
   js/index.js — Login / Setup page logic
   ============================================================ */

// ----- Test Database Connection -----
function testConnection() {
    showAlert('Opening database connection test...', 'success');
    window.open('test_connection.php', '_blank');
}

// ----- Login Handler -----
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role      = document.getElementById('role').value;

    // Demo shortcut — works without a database
    if (username === 'admin' && password === 'admin123') {
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = `dashboard-${role}.html`;
        }, 1000);
        return;
    }

    // Full API login (requires XAMPP + imported schema)
    fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = `dashboard-${result.role}.html`;
            }, 1000);
        } else {
            showAlert(result.message || 'Invalid credentials. Please check database setup.', 'error');
        }
    })
    .catch(() => {
        showAlert(
            'Connection error! Please ensure:\n' +
            '1. XAMPP MySQL is running\n' +
            '2. Database is imported\n' +
            '3. Try "Test Database Connection" button above',
            'error'
        );
    });
}

// ----- Alert Helper -----
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className    = `alert alert-${type}`;
    alert.style.display = 'block';

    if (type === 'error') {
        setTimeout(() => { alert.style.display = 'none'; }, 8000);
    }
}

// ----- First-Visit Greeting -----
window.onload = function () {
    const hasSeenSetup = localStorage.getItem('setup_seen');
    if (!hasSeenSetup) {
        showAlert('👋 First time here? Please complete the setup steps above before logging in!', 'success');
        localStorage.setItem('setup_seen', 'true');
    }
};

/* ============================================================
   js/index.js — Login page logic
   ============================================================ */

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('api/check-session.php');
        const data = await response.json();
        if (data.logged_in) {
            // Redirect to appropriate dashboard
            window.location.href = `dashboard-${data.user.role}.php`;
        }
    } catch (error) {
        console.log('Not logged in');
    }
});

// ----- Login Handler -----
async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = `dashboard-${result.role}.php`;
            }, 500);
        } else {
            showAlert(result.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        showAlert(
            'Connection error! Please ensure:\n' +
            '1. XAMPP/WAMP/MAMP is running\n' +
            '2. MySQL server is active\n' +
            '3. Database schema is imported',
            'error'
        );
    }
}

// ----- Alert Helper -----
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className    = `alert alert-${type}`;
    alert.style.display = 'block';

    if (type === 'error') {
        setTimeout(() => { alert.style.display = 'none'; }, 6000);
    }
}


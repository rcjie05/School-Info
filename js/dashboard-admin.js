/* ============================================================
   js/dashboard-admin.js — Admin modal helpers
   ============================================================ */

// ----- Modal Open / Close -----
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ----- Logout Function -----
function logout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }

    fetch('./api/logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
    })
    .then(data => {
        // Redirect to index.html after successful logout
        if (data.success) {
            window.location.href = 'index.html';
        } else {
            alert("Logout failed: " + (data.message || "Unknown error"));
            // Redirect anyway for safety
            window.location.href = 'index.html';
        }
    })
    .catch(error => {
        console.error("Logout error:", error);
        // Redirect anyway to ensure user is logged out visually
        window.location.href = 'index.html';
    });
}

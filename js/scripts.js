/* ============================================================
   js/scripts.js — Shared logic for all dashboard pages
   ============================================================ */

// ----- Sidebar Navigation -----
// Switches the active menu highlight and shows the matching content section.
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
        // Let inline onclick handlers run (e.g., logout)
        if (this.getAttribute('onclick')) return;

        // Remove active from every menu item and mark this one
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        const page = this.getAttribute('data-page');
        const link = this.getAttribute('data-link');

        // If this item navigates to another page, persist active state and navigate
        if (link) {
            try { localStorage.setItem('activePage', page); } catch (err) { /* ignore */ }
            window.location.href = link;
            return;
        }

        // Show only the matching content section (in-page navigation)
        if (page) {
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            const target = document.getElementById(page);
            if (target) target.classList.add('active');

            // Clear persisted state for in-page navigation
            try { localStorage.removeItem('activePage'); } catch (err) { /* ignore */ }
        }
    });
});

// Restore active page from storage on page load (if present)
document.addEventListener('DOMContentLoaded', function () {
    try {
        const stored = localStorage.getItem('activePage');
        if (stored) {
            const target = document.querySelector('.menu-item[data-page="' + stored + '"]');
            if (target) {
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                target.classList.add('active');
                // If mapped to an in-page section, show it
                const section = document.getElementById(stored);
                if (section) {
                    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                    section.classList.add('active');
                }
            }
            // Remove the saved state after applying it once
            localStorage.removeItem('activePage');
        }
    } catch (err) { /* ignore storage errors */ }
});

// ----- Logout -----
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}

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

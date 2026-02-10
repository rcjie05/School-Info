/* ============================================================
   js/dashboard-student.js — Chatbot, room info, feedback form
   ============================================================ */

// ----- Chatbot Toggle -----
function toggleChatbot() {
    document.getElementById('chatbotWindow').classList.toggle('active');
}

// ----- Send a Chat Message -----
function sendMessage() {
    const input            = document.getElementById('chatInput');
    const message          = input.value.trim();
    if (!message) return;

    const messagesContainer = document.getElementById('chatMessages');

    // Append user bubble
    messagesContainer.innerHTML += `
        <div class="message message-user">
            <div class="message-avatar">👤</div>
            <div class="message-bubble">${message}</div>
        </div>
    `;
    input.value = '';

    // Simulate a bot reply after 1 s
    setTimeout(() => {
        const response = getBotResponse(message);
        messagesContainer.innerHTML += `
            <div class="message message-bot">
                <div class="message-avatar">🤖</div>
                <div class="message-bubble">${response}</div>
            </div>
        `;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ----- Keyword-Based Bot Replies -----
function getBotResponse(message) {
    const m = message.toLowerCase();

    if (m.includes('room') || m.includes('building')) {
        return 'I can help you find any room on campus! Try searching for a room number like \'EB-201\' or a building name. You can also use the Campus Map page for a visual guide.';
    }
    if (m.includes('schedule')) {
        return 'Your class schedule is available on the \'My Schedule\' page. You can see all your subjects, times, rooms, and instructors there.';
    }
    if (m.includes('grade')) {
        return 'Your grades are available on the \'Grades\' page. You can view both midterm and final grades for current and past semesters.';
    }
    if (m.includes('faculty') || m.includes('teacher') || m.includes('professor')) {
        return 'Check the Faculty Directory page to find any instructor\'s office location and office hours. You can search by name or department.';
    }
    if (m.includes('help')) {
        return 'I can help you with: finding rooms and buildings, viewing your schedule, checking grades, locating faculty offices, and answering general campus questions. What would you like to know?';
    }
    return 'I\'m here to help! You can ask me about room locations, schedules, grades, faculty offices, or any general campus information.';
}

// ----- Enter Key Sends Message -----
document.getElementById('chatInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});

// ----- Room Info Popup -----
function showRoomInfo(room) {
    alert(
        `Room Information: ${room}\n\n` +
        'This would show detailed room information including:\n' +
        '- Building location\n' +
        '- Floor number\n' +
        '- Room type\n' +
        '- Capacity\n' +
        '- Facilities\n' +
        '- Interactive map with directions'
    );
}

// ----- Feedback Form -----
document.getElementById('feedbackForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thank you for your feedback! Your message has been submitted successfully.');
    this.reset();
});
// Logout function – redirects to index.html after successful logout
function logout() {
    if (!confirm("Are you sure you want to log out?")) {
        return;
    }

    fetch('./api/logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
    })
    .then(data => {
        // Redirect to index.html after successful logout
        if (data.success) {
            window.location.href = "index.html";
        } else {
            alert("Server says: " + (data.message || "unknown problem"));
            // Redirect anyway for safety
            window.location.href = "index.html";
        }
    })
    .catch(err => {
        console.error("Logout failed:", err);
        // Force redirect anyway — better than staying logged in visually
        window.location.href = "index.html";
    });
}
// floor-script.js

const canvas = document.getElementById('floorPlan');
const ctx = canvas.getContext('2d');

// Get role from PHP-passed variable
let currentRole = window.currentUserRole || "student";
let currentUser = currentRole;  // kept for compatibility with existing code
let canEdit = window.canEditRoutes || false;
let routeDrawMode = false;
let waypoints = [];
let startRoom = null;
let endRoom = null;
let savedRoutes = [];
let zoomLevel = 1;
let panX = 0;
let panY = 0;

// API Integration Functions
async function loadRoutesFromAPI() {
    try {
        const response = await fetch('./api/routes.php', {
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            savedRoutes = data.routes || [];
            if (currentRole === 'admin') {
                displaySavedRoutes();
            } else {
                displayStudentRoutes();
            }
            return savedRoutes;
        }
    } catch (error) {
        console.error('Error loading routes:', error);
    }
    return [];
}

async function saveRouteToAPI(routeData) {
    try {
        const response = await fetch('./api/routes.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(routeData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving route:', error);
        return { success: false, message: 'Network error' };
    }
}

async function deleteRouteFromAPI(routeId) {
    try {
        const response = await fetch('./api/routes.php', {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: routeId })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error deleting route:', error);
        return { success: false, message: 'Network error' };
    }
}

// Room definitions
const rooms = [
    { name: 'AVP Office',       x: 10,   y: 15,  width: 200, height: 95,  color: '#F4D03F', centerX: 110, centerY: 62  },
    { name: 'College Classroom', x: 210,  y: 15,  width: 185, height: 95,  color: '#85C1E2', centerX: 302, centerY: 62  },
    { name: 'Computer Lab',      x: 395,  y: 15,  width: 175, height: 95,  color: '#85C1E2', centerX: 482, centerY: 62  },
    { name: 'Clinic',            x: 570,  y: 15,  width: 185, height: 95,  color: '#7DCEA0', centerX: 662, centerY: 62  },
    { name: 'BED Principal',     x: 10,   y: 155, width: 115, height: 105, color: '#F4D03F', centerX: 67,  centerY: 207 },
    { name: 'Vice President',    x: 125,  y: 155, width: 115, height: 105, color: '#F4D03F', centerX: 182, centerY: 207 },
    { name: 'Registrar',         x: 10,   y: 260, width: 230, height: 165, color: '#F4D03F', centerX: 125, centerY: 342 },
    { name: 'Quadrangle',        x: 280,  y: 200, width: 275, height: 225, color: '#F1948A', centerX: 417, centerY: 312 },
    { name: 'MIS Office',        x: 400,  y: 155, width: 355, height: 45,  color: '#F4D03F', centerX: 577, centerY: 177 },
    { name: 'CR 5',              x: 755,  y: 155, width: 130, height: 45,  color: '#7DCEA0', centerX: 820, centerY: 177 },
    { name: 'Marketing',         x: 555,  y: 200, width: 100, height: 45,  color: '#F4D03F', centerX: 605, centerY: 222 },
    { name: 'CCTI',              x: 755,  y: 200, width: 130, height: 45,  color: '#F4D03F', centerX: 820, centerY: 222 },
    { name: 'BSBA Office',       x: 555,  y: 245, width: 100, height: 55,  color: '#F4D03F', centerX: 605, centerY: 272 },
    { name: 'Guidance',          x: 755,  y: 245, width: 130, height: 55,  color: '#F4D03F', centerX: 820, centerY: 272 },
    { name: 'Playgroup',         x: 585,  y: 335, width: 135, height: 45,  color: '#85C1E2', centerX: 652, centerY: 357 },
    { name: 'CR 1',              x: 755,  y: 335, width: 130, height: 45,  color: '#7DCEA0', centerX: 820, centerY: 357 },
    { name: 'Lounging Room',     x: 585,  y: 380, width: 135, height: 45,  color: '#7DCEA0', centerX: 652, centerY: 402 },
    { name: 'CR 2',              x: 755,  y: 380, width: 130, height: 45,  color: '#7DCEA0', centerX: 820, centerY: 402 },
    { name: 'CR 3',              x: 755,  y: 425, width: 130, height: 45,  color: '#7DCEA0', centerX: 820, centerY: 447 },
    { name: 'CR 4',              x: 755,  y: 470, width: 130, height: 35,  color: '#7DCEA0', centerX: 820, centerY: 487 },
    { name: 'Banko Maximo',      x: 10,   y: 495, width: 115, height: 115, color: '#7DCEA0', centerX: 67,  centerY: 552 },
    { name: 'HR',                x: 125,  y: 495, width: 115, height: 115, color: '#F4D03F', centerX: 182, centerY: 552 },
    { name: 'Chapel',            x: 575,  y: 510, width: 310, height: 100, color: '#F1948A', centerX: 730, centerY: 560 }
];

// ────────────────────────────────────────────────
// Initialize on page load
// ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async function() {
    await initializeFloorPlan();
});

async function initializeFloorPlan() {
    populateRoomSelects();
    await loadRoutesFromAPI();
    drawFloorPlan();
    
    // Show appropriate panel based on role
    const mainContent = document.getElementById('mainContent');
    if (currentRole === "admin") {
        mainContent.classList.add('admin-mode');
    } else {
        mainContent.classList.add('student-mode');
    }
}

// ────────────────────────────────────────────────
// Zoom controls
// ────────────────────────────────────────────────
function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.2, 3);
    drawFloorPlan();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.2, 0.5);
    drawFloorPlan();
}

function resetZoom() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    drawFloorPlan();
}

// ────────────────────────────────────────────────
// Load / Save routes (localStorage)
// ────────────────────────────────────────────────
// loadSavedRoutes and saveRoutesToStorage are now handled by loadRoutesFromAPI() and saveRouteToAPI()
// These functions are kept as stubs for backward compatibility
function loadSavedRoutes() {
    // Deprecated - using API now
    loadRoutesFromAPI();
}

function saveRoutesToStorage() {
    // Deprecated - using API now  
    // Routes are automatically saved via API calls
}


// ────────────────────────────────────────────────
// Populate room dropdowns
// ────────────────────────────────────────────────
function populateRoomSelects() {
    const startSelect = document.getElementById('startRoom');
    const endSelect   = document.getElementById('endRoom');

    startSelect.innerHTML = '<option value="">Select Starting Point</option>';
    endSelect.innerHTML   = '<option value="">Select Destination</option>';

    rooms.forEach(room => {
        const opt1 = document.createElement('option');
        opt1.value = room.name;
        opt1.text  = room.name;
        startSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = room.name;
        opt2.text  = room.name;
        endSelect.appendChild(opt2);
    });

    const isAdmin = currentRole === 'admin';
    startSelect.disabled = !isAdmin;
    endSelect.disabled   = !isAdmin;
}

// ────────────────────────────────────────────────
// Draw the entire floor plan + current route
// ────────────────────────────────────────────────
function drawFloorPlan() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(panX, panY);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw rooms
    rooms.forEach(room => {
        ctx.fillStyle = room.color;
        ctx.fillRect(room.x, room.y, room.width, room.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(room.x, room.y, room.width, room.height);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Lexend, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const words = room.name.split(' ');
        if (words.length > 1 && room.width < 150) {
            ctx.fillText(words[0], room.centerX, room.centerY - 8);
            ctx.fillText(words.slice(1).join(' '), room.centerX, room.centerY + 8);
        } else {
            ctx.fillText(room.name, room.centerX, room.centerY);
        }
    });

    // Draw current route being edited / viewed
    if (waypoints.length > 0 || (startRoom && endRoom)) {
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(255, 107, 107, 0.4)';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        if (startRoom) {
            if (waypoints.length > 0) {
                ctx.moveTo(startRoom.centerX, startRoom.centerY);
                ctx.lineTo(waypoints[0].x, waypoints[0].y);
            } else if (endRoom) {
                ctx.moveTo(startRoom.centerX, startRoom.centerY);
                ctx.lineTo(endRoom.centerX, endRoom.centerY);
            }
        }

        for (let i = 0; i < waypoints.length - 1; i++) {
            ctx.moveTo(waypoints[i].x, waypoints[i].y);
            ctx.lineTo(waypoints[i + 1].x, waypoints[i + 1].y);
        }

        if (endRoom && waypoints.length > 0) {
            ctx.moveTo(waypoints[waypoints.length - 1].x, waypoints[waypoints.length - 1].y);
            ctx.lineTo(endRoom.centerX, endRoom.centerY);
        }

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Waypoint circles + numbers
        waypoints.forEach((wp, index) => {
            ctx.fillStyle = '#4ECDC4';
            ctx.beginPath();
            ctx.arc(wp.x, wp.y, 12, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#2C3E50';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 14px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(index + 1, wp.x, wp.y);
        });
    }

    // Start / End markers
    if (startRoom) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(startRoom.centerX, startRoom.centerY, 14, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#065f46';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('S', startRoom.centerX, startRoom.centerY);
    }

    if (endRoom) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(endRoom.centerX, endRoom.centerY, 14, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('E', endRoom.centerX, endRoom.centerY);
    }

    ctx.restore();
}

// ────────────────────────────────────────────────
// Admin-only route creation functions
// ────────────────────────────────────────────────

function startDrawingRoute() {
    if (currentRole !== 'admin') return;

    const startName = document.getElementById('startRoom').value;
    const endName   = document.getElementById('endRoom').value;

    if (!startName || !endName) {
        alert('⚠️ Please select both starting point and destination first!');
        return;
    }
    if (startName === endName) {
        alert('⚠️ Starting point and destination cannot be the same!');
        return;
    }

    startRoom = rooms.find(r => r.name === startName);
    endRoom   = rooms.find(r => r.name === endName);

    routeDrawMode = true;
    document.getElementById('drawRouteBtn').classList.add('active');
    document.getElementById('modeIndicator').classList.add('active');
    canvas.style.cursor = 'crosshair';

    drawFloorPlan();
    showSuccessMessage('✏️ Route drawing mode activated! Click on the map to add waypoints.');
}

function findDirectRoute() {
    if (currentRole !== 'admin') return;

    const startName = document.getElementById('startRoom').value;
    const endName   = document.getElementById('endRoom').value;

    if (!startName || !endName) {
        alert('⚠️ Please select both starting point and destination!');
        return;
    }

    startRoom = rooms.find(r => r.name === startName);
    endRoom   = rooms.find(r => r.name === endName);
    waypoints = [];
    routeDrawMode = false;

    document.getElementById('drawRouteBtn').classList.remove('active');
    document.getElementById('modeIndicator').classList.remove('active');

    updateWaypointList();
    updateRouteInfo();
    drawFloorPlan();
    showSuccessMessage('✅ Direct route created successfully!');
}

function completeRoute() {
    if (currentRole !== 'admin') return;

    if (!startRoom || !endRoom) {
        alert('⚠️ Please select start and end points!');
        return;
    }

    routeDrawMode = false;
    document.getElementById('drawRouteBtn').classList.remove('active');
    document.getElementById('modeIndicator').classList.remove('active');
    updateRouteInfo();
    showSuccessMessage('✅ Route completed! You can now save it.');
}

// ────────────────────────────────────────────────
// Save / Load / Delete / Export / Import
// ────────────────────────────────────────────────

async function saveRoute() {
    if (currentRole !== 'admin') return;

    if (!startRoom || !endRoom) {
        alert('⚠️ Please create a route first!');
        return;
    }

    const routeName = document.getElementById('routeName').value.trim();
    if (!routeName) {
        alert('⚠️ Please enter a name for the route!');
        return;
    }

    const routeDescription = document.getElementById('routeDescription').value.trim();
    const visibleToStudents = document.getElementById('visibleToStudents').checked;

    const routeData = {
        name: routeName,
        description: routeDescription,
        start_room: startRoom.name,
        end_room: endRoom.name,
        waypoints: waypoints,
        visible_to_students: visibleToStudents
    };

    const result = await saveRouteToAPI(routeData);
    
    if (result.success) {
        await loadRoutesFromAPI(); // Reload routes from server
        
        document.getElementById('routeName').value = '';
        document.getElementById('routeDescription').value = '';
        document.getElementById('visibleToStudents').checked = true;

        showSuccessMessage(`💾 Route "${routeName}" saved successfully!`);
    } else {
        alert(`❌ Failed to save route: ${result.message || 'Unknown error'}`);
    }
}

function loadRoute(id) {
    const route = savedRoutes.find(r => r.id === id);
    if (!route) return;

    // Handle both old and new property names from API
    const startRoomName = route.start_room || route.startRoom;
    const endRoomName = route.end_room || route.endRoom;

    document.getElementById('startRoom').value = startRoomName;
    document.getElementById('endRoom').value = endRoomName;

    startRoom = rooms.find(r => r.name === startRoomName);
    endRoom   = rooms.find(r => r.name === endRoomName);
    waypoints = Array.isArray(route.waypoints) ? [...route.waypoints] : [];

    routeDrawMode = false;
    if (currentRole === 'admin') {
        const drawBtn = document.getElementById('drawRouteBtn');
        const modeIndicator = document.getElementById('modeIndicator');
        if (drawBtn) drawBtn.classList.remove('active');
        if (modeIndicator) modeIndicator.classList.remove('active');
    }

    updateWaypointList();
    updateRouteInfo();
    drawFloorPlan();

    showSuccessMessage(`✅ Route "${route.name}" loaded successfully!`);
}

async function deleteRoute(id) {
    if (currentRole !== 'admin') return;
    if (!confirm('🗑️ Are you sure you want to delete this route? This action cannot be undone.')) return;

    const result = await deleteRouteFromAPI(id);
    
    if (result.success) {
        await loadRoutesFromAPI(); // Reload routes from server
        showSuccessMessage('🗑️ Route deleted successfully!');
    } else {
        alert(`❌ Failed to delete route: ${result.message || 'Unknown error'}`);
    }
}

function toggleVisibility(id) {
    if (currentRole !== 'admin') return;

    const route = savedRoutes.find(r => r.id === id);
    if (!route) return;

    route.visibleToStudents = !route.visibleToStudents;
    saveRoutesToStorage();
    displaySavedRoutes();
    updateAdminStats();

    const status = route.visibleToStudents ? 'visible to' : 'hidden from';
    showSuccessMessage(`${route.visibleToStudents ? '👁️' : '🔒'} Route is now ${status} students!`);
}

function exportRoutes() {
    if (currentRole !== 'admin') return;
    if (savedRoutes.length === 0) {
        alert('⚠️ No routes to export!');
        return;
    }

    const dataStr = JSON.stringify(savedRoutes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floor-plan-routes-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showSuccessMessage('📤 Routes exported successfully!');
}

function importRoutes(event) {
    if (currentRole !== 'admin') return;

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                const newRoutes = imported.map(route => ({
                    ...route,
                    id: Date.now() + Math.random(),
                    visibleToStudents: route.visibleToStudents !== undefined ? route.visibleToStudents : true
                }));
                savedRoutes = [...savedRoutes, ...newRoutes];
                saveRoutesToStorage();
                displaySavedRoutes();
                updateAdminStats();
                showSuccessMessage(`📥 ${newRoutes.length} route(s) imported successfully!`);
            } else {
                alert('⚠️ Invalid file format!');
            }
        } catch (error) {
            alert('⚠️ Error reading file: ' + error.message);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ────────────────────────────────────────────────
// Canvas interaction (drawing waypoints)
// ────────────────────────────────────────────────
canvas.addEventListener('click', function(e) {
    if (currentRole !== 'admin' || !routeDrawMode) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((e.clientX - rect.left) * scaleX - panX) / zoomLevel;
    const y = ((e.clientY - rect.top) * scaleY - panY) / zoomLevel;

    waypoints.push({ x, y });
    updateWaypointList();
    drawFloorPlan();
});

// ────────────────────────────────────────────────
// Helper functions (waypoint list, distance, messages, etc.)
// ────────────────────────────────────────────────

function calculateTotalDistance() {
    let total = 0;
    if (waypoints.length === 0) {
        if (startRoom && endRoom) {
            total = Math.sqrt(
                Math.pow(endRoom.centerX - startRoom.centerX, 2) +
                Math.pow(endRoom.centerY - startRoom.centerY, 2)
            );
        }
    } else {
        let prevX = startRoom ? startRoom.centerX : waypoints[0].x;
        let prevY = startRoom ? startRoom.centerY : waypoints[0].y;

        waypoints.forEach(wp => {
            total += Math.sqrt(Math.pow(wp.x - prevX, 2) + Math.pow(wp.y - prevY, 2));
            prevX = wp.x;
            prevY = wp.y;
        });

        if (endRoom) {
            total += Math.sqrt(
                Math.pow(endRoom.centerX - prevX, 2) +
                Math.pow(endRoom.centerY - prevY, 2)
            );
        }
    }
    return Math.round(total / 10);
}

function updateWaypointList() {
    const list = document.getElementById('waypointList');
    if (waypoints.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--gray-500);">No waypoints yet</p>';
        return;
    }

    list.innerHTML = '';
    waypoints.forEach((wp, index) => {
        const item = document.createElement('div');
        item.className = 'waypoint-item';
        item.innerHTML = `
            <span>📍 Waypoint ${index + 1}</span>
            ${currentRole === 'admin' ? `<span class="delete-waypoint" onclick="deleteWaypoint(${index})" title="Delete waypoint">✕</span>` : ''}
        `;
        list.appendChild(item);
    });
}

function deleteWaypoint(index) {
    if (currentRole !== 'admin') return;
    waypoints.splice(index, 1);
    updateWaypointList();
    drawFloorPlan();
    showSuccessMessage('🗑️ Waypoint removed!');
}

function undoLastWaypoint() {
    if (currentRole !== 'admin') return;
    if (waypoints.length > 0) {
        waypoints.pop();
        updateWaypointList();
        drawFloorPlan();
        showSuccessMessage('↩️ Last waypoint removed!');
    }
}

function updateRouteInfo() {
    if (!startRoom || !endRoom) return;

    const routeInfo = document.getElementById('routeInfo');
    const routeDetails = document.getElementById('routeDetails');
    const distance = calculateTotalDistance();

    routeInfo.style.display = 'block';
    routeDetails.innerHTML = `
        <p style="margin-top: 10px;"><strong>From:</strong> ${startRoom.name}</p>
        <p><strong>To:</strong> ${endRoom.name}</p>
        <p><strong>Waypoints:</strong> ${waypoints.length}</p>
        <p><strong>Distance:</strong> ~${distance} meters</p>
        <p style="margin-top: 8px; color: var(--gray-600);">
            ${waypoints.length > 0 ? '🎨 Custom route' : '➡️ Direct route'}
        </p>
    `;
}

function clearRoute() {
    waypoints = [];
    startRoom = null;
    endRoom = null;
    routeDrawMode = false;

    if (currentRole === 'admin') {
        document.getElementById('drawRouteBtn').classList.remove('active');
        document.getElementById('modeIndicator').classList.remove('active');
    }
    document.getElementById('routeInfo').style.display = 'none';

    updateWaypointList();
    drawFloorPlan();
    showSuccessMessage('🗑️ Route cleared!');
}

function resetAll() {
    clearRoute();
    if (currentRole === 'admin') {
        document.getElementById('startRoom').value = '';
        document.getElementById('endRoom').value = '';
        document.getElementById('routeName').value = '';
        document.getElementById('routeDescription').value = '';
        document.getElementById('visibleToStudents').checked = true;
    }
}

function showSuccessMessage(message) {
    const msgEl = document.getElementById('successMessage');
    msgEl.textContent = message;
    msgEl.classList.add('show');
    setTimeout(() => msgEl.classList.remove('show'), 4000);
}

// ────────────────────────────────────────────────
// Display saved routes (admin view)
// ────────────────────────────────────────────────
function displaySavedRoutes() {
    const container = document.getElementById('savedRoutesList');

    if (savedRoutes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p><strong>No saved routes yet</strong></p>
                <p style="font-size: 0.9em; margin-top: 5px;">Create and save your first route!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    savedRoutes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'saved-route-card';

        const date = new Date(route.createdAt).toLocaleDateString();
        const visibilityIcon = route.visibleToStudents ? '👁️' : '🔒';
        const visibilityText = route.visibleToStudents ? 'Visible to students' : 'Hidden from students';

        card.innerHTML = `
            <h4>${route.name} ${visibilityIcon}</h4>
            ${route.description ? `<p>${route.description}</p>` : ''}
            <p><strong>From:</strong> ${route.startRoom}</p>
            <p><strong>To:</strong> ${route.endRoom}</p>
            <p style="font-size: 0.85em; color: ${route.visibleToStudents ? 'var(--success)' : 'var(--gray-500)'};"><strong>${visibilityText}</strong></p>
            <div class="route-meta">
                <span>📍 ${route.waypoints.length} waypoints</span>
                <span>📏 ~${route.distance}m</span>
            </div>
            <div class="route-meta">
                <span>📅 ${date}</span>
            </div>
            <div class="route-actions">
                <button class="btn btn-success btn-small" onclick="loadRoute(${route.id})">📂 Load</button>
                <button class="btn btn-secondary btn-small" onclick="toggleVisibility(${route.id})">${route.visibleToStudents ? '🔒 Hide' : '👁️ Show'}</button>
                <button class="btn btn-clear btn-small" onclick="deleteRoute(${route.id})">🗑️ Delete</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ────────────────────────────────────────────────
// Student / Teacher / Registrar view of public routes
// ────────────────────────────────────────────────
function displayStudentRoutes() {
    document.getElementById('studentRouteSearch').value = '';
    filterStudentRoutes();
}

function filterStudentRoutes() {
    const searchTerm = document.getElementById('studentRouteSearch').value.toLowerCase().trim();
    const container = document.getElementById('studentRoutesList');
    const publicRoutes = savedRoutes.filter(r => r.visibleToStudents);

    if (publicRoutes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p><strong>No routes available</strong></p>
                <p style="font-size: 0.9em; margin-top: 5px;">Check back later for available routes</p>
            </div>
        `;
        return;
    }

    const filtered = publicRoutes.filter(route => {
        return (
            route.name.toLowerCase().includes(searchTerm) ||
            (route.description && route.description.toLowerCase().includes(searchTerm)) ||
            route.startRoom.toLowerCase().includes(searchTerm) ||
            route.endRoom.toLowerCase().includes(searchTerm)
        );
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <p><strong>No routes found</strong></p>
                <p style="font-size: 0.9em; margin-top: 5px;">Try a different search term</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    filtered.forEach(route => {
        const card = document.createElement('div');
        card.className = 'saved-route-card';

        const date = new Date(route.createdAt).toLocaleDateString();

        const highlight = (text, term) => {
            if (!term || !text) return text;
            const regex = new RegExp(`(${term})`, 'gi');
            return text.replace(regex, '<mark style="background:#fef3c7; padding:2px 4px; border-radius:3px;">$1</mark>');
        };

        card.innerHTML = `
            <h4>${highlight(route.name, searchTerm)}</h4>
            ${route.description ? `<p>${highlight(route.description, searchTerm)}</p>` : ''}
            <p><strong>From:</strong> ${highlight(route.startRoom, searchTerm)}</p>
            <p><strong>To:</strong> ${highlight(route.endRoom, searchTerm)}</p>
            <div class="route-meta">
                <span>📍 ${route.waypoints.length} waypoints</span>
                <span>📏 ~${route.distance}m</span>
            </div>
            <div class="route-meta">
                <span>📅 ${date}</span>
            </div>
            <div class="route-actions">
                <button class="btn btn-success btn-small" onclick="loadRoute(${route.id})" style="width:100%">🗺️ View Route</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ────────────────────────────────────────────────
// Admin stats
// ────────────────────────────────────────────────
function updateAdminStats() {
    if (currentRole !== 'admin') return;

    const statsEl = document.getElementById('adminStats');
    if (savedRoutes.length > 0) {
        statsEl.style.display = 'grid';
        document.getElementById('totalRoutesCount').textContent = savedRoutes.length;
        document.getElementById('publicRoutesCount').textContent = savedRoutes.filter(r => r.visibleToStudents).length;
    } else {
        statsEl.style.display = 'none';
    }
}

// ────────────────────────────────────────────────
// Initialize on page load
// ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    changeUserRole("student");
});
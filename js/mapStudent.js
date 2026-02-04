/* mapStudent.js — student-facing UI glue (initializes the DOM and hooks into mapEngine)
   Exposes initStudentMap(containerId)
*/
(function () {
    function createDOMStructure(containerId) {
        const container = document.getElementById(containerId);
        if (!container) { console.error('Container not found:', containerId); return null; }
        container.classList.add('map-panel');

        container.innerHTML = `
            <div class="map-toolbar">
                <div class="map-search-wrap">
                    <label for="searchBox">Search rooms</label>
                    <input id="searchBox" class="map-search" placeholder="Search for room, building, or department..." />
                </div>
                <div class="map-floor-btns" id="floorButtons"></div>
            </div>
            <div class="map-legend">
                <div class="map-legend-item"><div class="map-legend-swatch swatch-office"></div> Office</div>
                <div class="map-legend-item"><div class="map-legend-swatch swatch-classroom"></div> Classroom</div>
                <div class="map-legend-item"><div class="map-legend-swatch swatch-facility"></div> Facility</div>
                <div class="map-legend-item"><div class="map-legend-swatch swatch-special"></div> Special</div>
            </div>
            <div class="main-map-row" style="display:grid;grid-template-columns:320px 1fr;gap:18px;">
                <aside class="map-sidebar">
                    <div class="search-section">
                        <h3>Search & Rooms</h3>
                        <input id="sidebarSearch" class="search-box" placeholder="Search rooms..." list="roomsDatalist" autocomplete="off" />
                        <datalist id="roomsDatalist"></datalist>
                        <div class="room-list" id="roomList" style="margin-top:12px"></div>
                    </div>
                    <div class="navigation-controls">
                        <h4>Find Route</h4>
                        <select id="fromLocation" class="nav-select"><option value="">From...</option></select>
                        <select id="toLocation" class="nav-select"><option value="">To...</option></select>
                        <button id="findRouteBtn" class="find-route-btn" disabled>Find Route</button>
                        <div id="directionsPanel" class="map-directions" style="margin-top:12px;display:none"></div>
                    </div>
                    <div id="waypointToolbar" class="map-editor-bar" style="display:none">
                        <button id="addNodeBtn" class="map-editor-btn btn-add">Add Node</button>
                        <button id="toggleEdgeBtn" class="map-editor-btn btn-edge">Toggle Edge</button>
                        <button id="removeNodeBtn" class="map-editor-btn btn-remove">Remove Node</button>
                        <button id="saveWaypointsBtn" class="map-editor-btn btn-save">Save Waypoints</button>
                        <label style="margin-left:auto">Edit Mode <input id="editWaypointsToggle" type="checkbox" /></label>
                    </div>
                </aside>
                <section class="map-area">
                    <div id="mapCanvas"></div>
                </section>
            </div>
        `;

        return container;
    }

    function initFloorButtons(container) {
        const btnWrap = container.querySelector('#floorButtons');
        btnWrap.innerHTML = '';
        const floors = Object.keys(window.floorData || {});
        floors.forEach(f => {
            const btn = document.createElement('button'); btn.className = 'map-floor-btn'; btn.textContent = window.floorData[f].name || f; btn.dataset.floor = f;
            btn.addEventListener('click', function () { document.querySelectorAll('.map-floor-btn').forEach(b => b.classList.remove('active')); this.classList.add('active'); window.mapEngine.setFloor(f); renderAndSync(); });
            btnWrap.appendChild(btn);
        });
        // set first active
        const first = btnWrap.querySelector('button'); if (first) first.classList.add('active');
    }

    function renderAndSync() {
        const canvas = document.getElementById('mapCanvas');
        window.mapEngine.renderFloorPlanInto(canvas);
        populateRoomList();
        populateNavigationSelects();
        populateRoomsDatalist();
        hideDirections();
    }

    // Room list (grouped by type) and search
    function populateRoomList() {
        const list = document.getElementById('roomList'); list.innerHTML = '';
        const floor = window.mapEngine.state.currentFloor;
        const q = document.getElementById('sidebarSearch').value.toLowerCase();
        const rooms = (window.floorData[floor] && window.floorData[floor].rooms) ? window.floorData[floor].rooms : [];
        // match name or type
        const filtered = rooms.filter(r => r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q));
        if (!filtered.length) { list.innerHTML = '<p style="color:#999;padding:14px;text-align:center">No rooms found</p>'; return; }

        const order = ['office','classroom','facility','special'];
        const groups = {};
        filtered.forEach(r => { if (!groups[r.type]) groups[r.type] = []; groups[r.type].push(r); });

        let html = '';
        order.forEach(type => {
            if (!groups[type] || !groups[type].length) return;
            const title = type.charAt(0).toUpperCase() + type.slice(1);
            html += `<div class="room-group" data-type="${type}">
                        <div class="group-header">
                            <div class="group-title">${title}</div>
                            <div class="group-meta"><span class="group-count">${groups[type].length}</span><button class="group-toggle">▾</button></div>
                        </div>
                        <div class="group-items">`;
            groups[type].forEach(r => {
                html += `<div class="room-item" data-room-id="${r.id}"><strong>${r.name}</strong> <span class="info-badge">${r.type}</span></div>`;
            });
            html += `</div></div>`;
        });

        list.innerHTML = html;

        // Collapse handlers
        list.querySelectorAll('.group-header').forEach(h => {
            h.addEventListener('click', function () {
                const grp = this.parentElement;
                grp.classList.toggle('collapsed');
                const btn = this.querySelector('.group-toggle');
                btn.textContent = grp.classList.contains('collapsed') ? '▸' : '▾';
            });
        });

        // Room click handlers
        list.querySelectorAll('.room-item').forEach(it => {
            it.addEventListener('click', function () {
                const id = this.dataset.roomId;
                window.mapEngine.highlightRoom(id);
                if (typeof window.onRoomSelected === 'function') window.onRoomSelected(id);
            });
        });
    }

    function populateNavigationSelects() {
        const from = document.getElementById('fromLocation'), to = document.getElementById('toLocation');
        from.innerHTML = '<option value="">From...</option>'; to.innerHTML = '<option value="">To...</option>';
        const all = [];
        Object.keys(window.floorData || {}).forEach(f => {
            window.floorData[f].rooms.forEach(room => all.push({ floor: f, id: room.id, name: room.name }));
        });
        all.forEach(r => {
            const o1 = document.createElement('option'); o1.value = `${r.floor}-${r.id}`; o1.textContent = `${window.floorData[r.floor].name} - ${r.name}`; from.appendChild(o1);
            const o2 = document.createElement('option'); o2.value = `${r.floor}-${r.id}`; o2.textContent = `${window.floorData[r.floor].name} - ${r.name}`; to.appendChild(o2);
        });
    }

    function populateRoomsDatalist() {
        const dl = document.getElementById('roomsDatalist');
        if (!dl) return;
        dl.innerHTML = '';
        const all = [];
        Object.keys(window.floorData || {}).forEach(f => {
            (window.floorData[f].rooms || []).forEach(room => all.push({ floor: f, id: room.id, name: room.name, floorName: window.floorData[f].name }));
        });
        all.forEach(r => {
            const opt = document.createElement('option');
            opt.value = `${r.name} — ${r.floorName}`;
            opt.dataset.floor = r.floor;
            opt.dataset.id = r.id;
            dl.appendChild(opt);
        });
    }

    function hideDirections() { document.getElementById('directionsPanel').style.display = 'none'; document.getElementById('directionsPanel').innerHTML = ''; }
    function showDirections(steps) { const panel = document.getElementById('directionsPanel'); panel.style.display = 'block'; panel.innerHTML = `<h4>Directions</h4>` + steps.map((s,i)=>`<div class="map-dir-step"><strong>Step ${i+1}:</strong> ${s}</div>`).join(''); }

    // Simple directions generator (textual)
    function generateDirections(fromVal, toVal) {
        const parse = v => { const idx = v.indexOf('-'); return idx === -1 ? { floor: v, id: '' } : { floor: v.slice(0, idx), id: v.slice(idx + 1) }; };
        const from = parse(fromVal), to = parse(toVal);
        const fromRoom = window.floorData[from.floor] && window.floorData[from.floor].rooms.find(r => r.id === from.id);
        const toRoom = window.floorData[to.floor] && window.floorData[to.floor].rooms.find(r => r.id === to.id);
        if (!fromRoom || !toRoom) { showDirections(['Invalid start or end selection']); return; }
        const steps = [];
        if (from.floor === to.floor) { steps.push(`You are on the same floor (${window.floorData[from.floor].name})`); steps.push(`Walk from ${fromRoom.name} to ${toRoom.name}`); }
        else {
            steps.push(`Start: ${fromRoom.name} (${window.floorData[from.floor].name})`);
            steps.push(`Head to the nearest stairwell and change floors to ${window.floorData[to.floor].name}`);
            steps.push(`Proceed to ${toRoom.name}`);
        }
        steps.push(`You have arrived at ${toRoom.name}`);
        showDirections(steps);
        // switch to floor and draw path if same floor
        window.mapEngine.setFloor(to.floor);
        renderAndSync();
        if (from.floor === to.floor) {
            window.mapEngine.clearPath(); window.mapEngine.state.startRoom = from.id; window.mapEngine.state.endRoom = to.id; window.mapEngine.drawPath(from.id, to.id);
        }
    }

    // Waypoint editor toolbar handlers (save to localStorage)
    function attachWaypointTools(container) {
        const toggle = container.querySelector('#editWaypointsToggle');
        const addBtn = container.querySelector('#addNodeBtn');
        const toggleEdgeBtn = container.querySelector('#toggleEdgeBtn');
        const removeBtn = container.querySelector('#removeNodeBtn');
        const saveBtn = container.querySelector('#saveWaypointsBtn');
        if (!toggle) return;
        toggle.addEventListener('change', function () {
            const visible = this.checked; container.querySelector('#waypointToolbar').style.display = visible ? 'flex' : 'none';
            if (visible) alert('Waypoint edit enabled. Use the tools to add/remove nodes and edges.');
        });
        addBtn.addEventListener('click', function () { alert('Add node: Click on empty map space (not inside rooms) to add a node.'); window.waypointEditorMode = 'add'; setupMapClickForAdd(); });
        toggleEdgeBtn.addEventListener('click', function () { alert('Toggle edge: Click one node, then another to toggle edge.'); window.waypointEditorMode = 'toggleEdge'; setupMapClickForToggle(); });
        removeBtn.addEventListener('click', function () { alert('Remove node: Click a node to remove it.'); window.waypointEditorMode = 'remove'; setupMapClickForRemove(); });
        saveBtn.addEventListener('click', function () { try { localStorage.setItem('waypointGraph', JSON.stringify(window.waypointGraph || {})); alert('Waypoints saved'); } catch (e) { alert('Failed to save: ' + e.message); } });
    }

    // Very small waypoint editors using the SVG overlay – minimal safe implementation
    function setupMapClickForAdd() {
        const svg = document.getElementById('map-path-svg'); if (!svg) return;
        function handler(e) {
            const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
            const rooms = window.floorData[window.mapEngine.state.currentFloor].rooms || [];
            for (let i = 0; i < rooms.length; i++) { const r = rooms[i]; if (loc.x >= r.x && loc.x <= r.x + r.w && loc.y >= r.y && loc.y <= r.y + r.h) { alert('Cannot add inside a room'); return; } }
            window.mapEngine.ensureWaypointFloor(window.mapEngine.state.currentFloor);
            const id = 'n' + Date.now(); window.waypointGraph[window.mapEngine.state.currentFloor].nodes[id] = { x: Math.max(1,Math.min(99,loc.x)), y: Math.max(1,Math.min(99,loc.y)) };
            renderAndSync(); svg.removeEventListener('click', handler);
        }
        svg.addEventListener('click', handler);
    }
    function setupMapClickForToggle() { alert('Toggle-edge not implemented in full; use waypoint inspector to edit graph via console.'); }
    function setupMapClickForRemove() { alert('Remove node mode: not fully interactive in this build.'); }

    // Event hookups
    function attachSearchAndNavigation() {
        const sb = document.getElementById('sidebarSearch');
        const dl = document.getElementById('roomsDatalist');
        sb.addEventListener('input', function () {
            const val = this.value.trim();
            const opts = dl ? Array.from(dl.options) : [];
            const match = opts.find(o => o.value === val);
            if (match) {
                const floor = match.dataset.floor;
                const id = match.dataset.id;
                window.mapEngine.setFloor(floor);
                renderAndSync();
                setTimeout(() => {
                    window.mapEngine.highlightRoom(id);
                    if (typeof window.onRoomSelected === 'function') window.onRoomSelected(id);
                }, 60);
            } else {
                populateRoomList();
            }
        });
        const findBtn = document.getElementById('findRouteBtn'); const from = document.getElementById('fromLocation'); const to = document.getElementById('toLocation');
        function updateButton() { findBtn.disabled = !from.value || !to.value; }
        from.addEventListener('change', updateButton); to.addEventListener('change', updateButton);
        findBtn.addEventListener('click', function () { generateDirections(from.value, to.value); });

        // map room -> sidebar selection sync
        window.onRoomSelected = function (roomId) { const sidebar = document.querySelector(`.room-item[data-room-id="${roomId}"]`); if (sidebar) { document.querySelectorAll('.room-item').forEach(i => i.classList.remove('selected')); sidebar.classList.add('selected'); } };
    }

    // init exposed to global
    window.initStudentMap = function (containerId) {
        const container = createDOMStructure(containerId); if (!container) return;
        initFloorButtons(container);
        attachSearchAndNavigation(); attachWaypointTools(container);
        // set default floor
        const firstFloor = Object.keys(window.floorData || {})[0] || 'ground'; window.mapEngine.setFloor(firstFloor);
        renderAndSync();
        console.info('initStudentMap completed');
    };
})();
/* mapEngine.js — core rendering and pathfinding for the floor plan
   Exposes a small API on window.mapEngine used by mapStudent.js
*/
(function () {
    // Public state
    const state = {
        currentFloor: 'ground',
        selectedRoom: null,
        startRoom: null,
        endRoom: null
    };

    // Utility helpers
    function _dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function pointInRect(p, rect) { return p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h; }

    // Segment / rect helpers
    function _orient(a, b, c) { return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x); }
    function _onSegment(a, b, p) { return Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y); }
    function segmentsIntersect(a, b, c, d) {
        const o1 = _orient(a, b, c), o2 = _orient(a, b, d), o3 = _orient(c, d, a), o4 = _orient(c, d, b);
        if (o1 * o2 < 0 && o3 * o4 < 0) return true;
        if (o1 === 0 && _onSegment(a, b, c)) return true;
        if (o2 === 0 && _onSegment(a, b, d)) return true;
        if (o3 === 0 && _onSegment(c, d, a)) return true;
        if (o4 === 0 && _onSegment(c, d, b)) return true;
        return false;
    }
    function segmentIntersectsRect(p1, p2, rect) {
        if (pointInRect(p1, rect) && pointInRect(p2, rect)) return true;
        const r1 = { x: rect.x, y: rect.y };
        const r2 = { x: rect.x + rect.w, y: rect.y };
        const r3 = { x: rect.x + rect.w, y: rect.y + rect.h };
        const r4 = { x: rect.x, y: rect.y + rect.h };
        if (segmentsIntersect(p1, p2, r1, r2)) return true;
        if (segmentsIntersect(p1, p2, r2, r3)) return true;
        if (segmentsIntersect(p1, p2, r3, r4)) return true;
        if (segmentsIntersect(p1, p2, r4, r1)) return true;
        if (pointInRect(p1, rect) !== pointInRect(p2, rect)) return true;
        return false;
    }

    function isSegmentClear(floor, p1, p2, ignoreRoomIds = []) {
        const rooms = window.floorData && window.floorData[floor] && window.floorData[floor].rooms ? window.floorData[floor].rooms : [];
        for (let i = 0; i < rooms.length; i++) {
            const r = rooms[i];
            if (ignoreRoomIds.includes(r.id)) continue;
            const pad = 0.5;
            const rect = { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 };
            if (segmentIntersectsRect(p1, p2, rect)) return false;
        }
        return true;
    }

    // Waypoint based A* pathfinder
    function getClosestNodeId(floor, x, y, ignoreRoomIds = []) {
        const graph = window.waypointGraph && window.waypointGraph[floor];
        if (!graph || !graph.nodes) return null;
        let best = null, bestD = Infinity;
        Object.keys(graph.nodes).forEach(id => {
            const n = graph.nodes[id];
            const d = Math.hypot(n.x - x, n.y - y);
            if (d < bestD && isSegmentClear(floor, { x, y }, n, ignoreRoomIds)) { bestD = d; best = id; }
        });
        if (!best) {
            Object.keys(graph.nodes).forEach(id => {
                const n = graph.nodes[id];
                const d = Math.hypot(n.x - x, n.y - y);
                if (d < bestD) { bestD = d; best = id; }
            });
        }
        return best;
    }

    function aStarPath(floor, startId, goalId) {
        const graph = window.waypointGraph && window.waypointGraph[floor];
        if (!graph || !graph.nodes || !graph.edges) return null;
        if (startId === goalId) return [startId];
        const nodes = graph.nodes, edges = graph.edges;
        const openSet = new Set([startId]);
        const cameFrom = {};
        const gScore = {}, fScore = {};
        Object.keys(nodes).forEach(id => { gScore[id] = Infinity; fScore[id] = Infinity; });
        gScore[startId] = 0; fScore[startId] = _dist(nodes[startId], nodes[goalId]);
        while (openSet.size > 0) {
            let current = null, bestF = Infinity;
            openSet.forEach(id => { if (fScore[id] < bestF) { bestF = fScore[id]; current = id; } });
            if (current === goalId) {
                const path = [current];
                while (cameFrom[path[0]]) path.unshift(cameFrom[path[0]]);
                return path;
            }
            openSet.delete(current);
            const neighbors = edges[current] || [];
            neighbors.forEach(nid => {
                if (!isSegmentClear(floor, nodes[current], nodes[nid])) return;
                const tentative = gScore[current] + _dist(nodes[current], nodes[nid]);
                if (tentative < gScore[nid]) {
                    cameFrom[nid] = current; gScore[nid] = tentative; fScore[nid] = tentative + _dist(nodes[nid], nodes[goalId]);
                    if (!openSet.has(nid)) openSet.add(nid);
                }
            });
        }
        return null;
    }

    // Grid fallback pathfinding
    function buildGrid(floor, cellSize = 2) {
        const cols = Math.ceil(100 / cellSize); const rows = Math.ceil(100 / cellSize);
        const grid = { cols, rows, cellSize, cells: Array.from({ length: rows }, () => Array(cols).fill(0)) };
        const rooms = window.floorData && window.floorData[floor] && window.floorData[floor].rooms ? window.floorData[floor].rooms : [];
        const pad = 0.6;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const rect = { x: c * cellSize, y: r * cellSize, w: cellSize, h: cellSize };
            for (let i = 0; i < rooms.length; i++) {
                const room = rooms[i];
                const roomRect = { x: room.x - pad, y: room.y - pad, w: room.w + pad * 2, h: room.h + pad * 2 };
                if (!(rect.x + rect.w < roomRect.x || roomRect.x + roomRect.w < rect.x || rect.y + rect.h < roomRect.y || roomRect.y + roomRect.h < rect.y)) { grid.cells[r][c] = 1; break; }
            }
        }
        return grid;
    }
    function gridToPoint(c, r, cellSize) { return { x: c * cellSize + cellSize / 2, y: r * cellSize + cellSize / 2 }; }
    function findNearestFreeCell(grid, x, y) {
        const c0 = Math.floor(x / grid.cellSize); const r0 = Math.floor(y / grid.cellSize);
        if (r0 >= 0 && r0 < grid.rows && c0 >= 0 && c0 < grid.cols && grid.cells[r0][c0] === 0) return { r: r0, c: c0 };
        const q = [{ r: r0, c: c0 }]; const seen = new Set([`${r0},${c0}`]); const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        while (q.length) {
            const { r, c } = q.shift();
            for (let i = 0; i < dirs.length; i++) {
                const nr = r + dirs[i][0]; const nc = c + dirs[i][1]; const key = `${nr},${nc}`;
                if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols || seen.has(key)) continue;
                if (grid.cells[nr][nc] === 0) return { r: nr, c: nc };
                seen.add(key); q.push({ r: nr, c: nc });
            }
        }
        return null;
    }

    function gridNeighbors(grid, r, c) {
        const res = []; const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        for (let i = 0; i < dirs.length; i++) {
            const nr = r + dirs[i][0], nc = c + dirs[i][1];
            if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols) continue;
            if (grid.cells[nr][nc] === 1) continue;
            if (Math.abs(dirs[i][0]) === 1 && Math.abs(dirs[i][1]) === 1) {
                if (grid.cells[r][nc] === 1 || grid.cells[nr][c] === 1) continue;
            }
            res.push({ r: nr, c: nc });
        }
        return res;
    }
    function gridHeuristic(a, b) {
        const dx = Math.abs(a.c - b.c), dy = Math.abs(a.r - b.r); const F = Math.SQRT2 - 1; return (dx < dy) ? F * dx + dy : F * dy + dx;
    }
    function gridAStar(grid, start, goal) {
        const startKey = `${start.r},${start.c}`, goalKey = `${goal.r},${goal.c}`;
        const open = new Set([startKey]); const cameFrom = {}; const gScore = {}; const fScore = {};
        function keyOf(n) { return `${n.r},${n.c}`; }
        gScore[startKey] = 0; fScore[startKey] = gridHeuristic(start, goal);
        while (open.size) {
            let current = null, best = Infinity; open.forEach(k => { if ((fScore[k] || Infinity) < best) { best = fScore[k]; current = k; } });
            if (!current) break; if (current === goalKey) {
                const path = []; let cur = current; while (cur) { const [rr, cc] = cur.split(',').map(Number); path.unshift({ r: rr, c: cc }); cur = cameFrom[cur]; } return path;
            }
            open.delete(current);
            const [cr, cc] = current.split(',').map(Number); const neighbors = gridNeighbors(grid, cr, cc);
            neighbors.forEach(nb => {
                const nk = keyOf(nb); const tentative = (gScore[current] || Infinity) + ((cr === nb.r || cc === nb.c) ? 1 : Math.SQRT2);
                if (tentative < (gScore[nk] || Infinity)) {
                    cameFrom[nk] = current; gScore[nk] = tentative; fScore[nk] = tentative + gridHeuristic(nb, goal); if (!open.has(nk)) open.add(nk);
                }
            });
        }
        return null;
    }

    function simplifyPoints(points) {
        if (!points || points.length < 3) return points; const res = [points[0]];
        for (let i = 1; i < points.length - 1; i++) {
            const a = res[res.length - 1], b = points[i], c = points[i + 1];
            const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
            if (Math.abs(cross) > 0.01) res.push(b);
        }
        res.push(points[points.length - 1]); return res;
    }

    function pointsToSmoothPath(pts, tension = 1) {
        if (!pts || pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
        if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = i === 0 ? pts[0] : pts[i - 1]; const p1 = pts[i]; const p2 = pts[i + 1]; const p3 = (i + 2 < pts.length) ? pts[i + 2] : p2;
            const c1x = p1.x + (p2.x - p0.x) / 6 * tension; const c1y = p1.y + (p2.y - p0.y) / 6 * tension; const c2x = p2.x - (p3.x - p1.x) / 6 * tension; const c2y = p2.y - (p3.y - p1.y) / 6 * tension;
            d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
        }
        return d;
    }

    // Get path points between centers using waypoints then fallback to grid
    function getPathPoints(floor, fromCenter, toCenter, startRoomId = null, endRoomId = null) {
        const graph = window.waypointGraph && window.waypointGraph[floor];
        if (!graph || !Object.keys(graph.nodes).length) return null;
        const startNode = getClosestNodeId(floor, fromCenter.x, fromCenter.y, startRoomId ? [startRoomId] : []);
        const endNode = getClosestNodeId(floor, toCenter.x, toCenter.y, endRoomId ? [endRoomId] : []);
        function buildPointsFromNodePath(nodePath, startAttach, endAttach) {
            const pts = [fromCenter]; if (startAttach) pts.push(startAttach); nodePath.forEach(id => { const n = graph.nodes[id]; pts.push({ x: n.x, y: n.y }); }); if (endAttach) pts.push(endAttach); pts.push(toCenter); return pts;
        }
        if (startNode && endNode) {
            const nodePath = aStarPath(floor, startNode, endNode);
            if (nodePath && nodePath.length > 0) return buildPointsFromNodePath(nodePath, null, null);
        }
        // compute attachment candidates
        const startDirect = Object.keys(graph.nodes).filter(id => isSegmentClear(floor, fromCenter, graph.nodes[id], startRoomId ? [startRoomId] : []));
        const endDirect = Object.keys(graph.nodes).filter(id => isSegmentClear(floor, toCenter, graph.nodes[id], endRoomId ? [endRoomId] : []));
        const startDetails = [], endDetails = [];
        if (startDirect.length) startDirect.forEach(id => startDetails.push({ id, attachPoint: graph.nodes[id] }));
        else if (startRoomId) {
            const startRoom = window.floorData[floor].rooms.find(r => r.id === startRoomId);
            if (startRoom) Object.keys(graph.nodes).forEach(id => { const nodeP = graph.nodes[id]; const attach = closestPointOnRect(startRoom, nodeP); if (isSegmentClear(floor, attach, nodeP)) startDetails.push({ id, attachPoint: attach }); });
        }
        if (endDirect.length) endDirect.forEach(id => endDetails.push({ id, attachPoint: graph.nodes[id] }));
        else if (endRoomId) {
            const endRoom = window.floorData[floor].rooms.find(r => r.id === endRoomId);
            if (endRoom) Object.keys(graph.nodes).forEach(id => { const nodeP = graph.nodes[id]; const attach = closestPointOnRect(endRoom, nodeP); if (isSegmentClear(floor, attach, nodeP)) endDetails.push({ id, attachPoint: attach }); });
        }
        let bestSolution = null, bestScore = Infinity;
        startDetails.forEach(s => { endDetails.forEach(e => { const pathBetween = aStarPath(floor, s.id, e.id); if (pathBetween && pathBetween.length > 0) {
            let score = 0; const nodes = graph.nodes; score += _dist(fromCenter, s.attachPoint); score += _dist(toCenter, e.attachPoint); for (let i = 0; i < pathBetween.length - 1; i++) score += _dist(nodes[pathBetween[i]], nodes[pathBetween[i + 1]]);
            if (score < bestScore) { bestScore = score; bestSolution = { pathBetween, startAttach: s.attachPoint, endAttach: e.attachPoint }; }
        } }); });
        if (bestSolution) return buildPointsFromNodePath(bestSolution.pathBetween, bestSolution.startAttach, bestSolution.endAttach);
        return null;
    }

    function closestPointOnRect(rect, p) {
        let cx = Math.max(rect.x, Math.min(p.x, rect.x + rect.w)); let cy = Math.max(rect.y, Math.min(p.y, rect.y + rect.h));
        const leftDist = Math.abs(cx - rect.x); const rightDist = Math.abs(cx - (rect.x + rect.w)); const topDist = Math.abs(cy - rect.y); const bottomDist = Math.abs(cy - (rect.y + rect.h));
        const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);
        if (minDist === leftDist) cx = rect.x; else if (minDist === rightDist) cx = rect.x + rect.w; else if (minDist === topDist) cy = rect.y; else cy = rect.y + rect.h; return { x: cx, y: cy };
    }

    // Grid A* wrapper
    function findGridPath(floor, fromCenter, toCenter) {
        const grid = buildGrid(floor);
        const start = findNearestFreeCell(grid, fromCenter.x, fromCenter.y);
        const goal = findNearestFreeCell(grid, toCenter.x, toCenter.y);
        if (!start || !goal) return null;
        const pathCells = gridAStar(grid, start, goal);
        if (!pathCells) return null;
        const pts = pathCells.map(pc => gridToPoint(pc.c, pc.r, grid.cellSize)); const simple = simplifyPoints(pts);
        return { points: simple, grid };
    }

    // Rendering helpers — these operate on a container element
    function renderFloorPlanInto(container) {
        if (!window.floorData || !window.floorData[state.currentFloor]) { container.innerHTML = '<p style="padding:20px;color:#666">No floor data available</p>'; return; }
        const floorMeta = window.floorData[state.currentFloor];
        const rooms = floorMeta.rooms || [];

        let html = '<div class="map-floorplan-wrap">';
        html += '<div class="map-floorplan" id="map-floorplan-inner">';
        html += '<svg class="map-path-svg" id="map-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L5,3 z" fill="#ff6b6b"/></marker></defs></svg>';

        rooms.forEach(room => {
            html += `<div class="map-room ${room.type}" data-room-id="${room.id}" style="left:${room.x}%;top:${room.y}%;width:${room.w}%;height:${room.h}%">${room.name}</div>`;
        });

        html += '</div></div>';
        container.innerHTML = html;

        // Add click handlers to rooms
        container.querySelectorAll('.map-room').forEach(el => {
            el.addEventListener('click', function () {
                const id = this.dataset.roomId;
                // Manage start/end selection
                if (!state.startRoom) { state.startRoom = id; state.selectedRoom = id; this.classList.add('start-point'); }
                else if (state.startRoom && !state.endRoom && id !== state.startRoom) { state.endRoom = id; state.selectedRoom = id; this.classList.add('end-point'); drawPath(state.startRoom, state.endRoom); }
                else { clearPath(); state.startRoom = id; state.endRoom = null; state.selectedRoom = id; this.classList.add('start-point'); }
                // highlight (map-only)
                highlightRoom(id);
                // NOTE: intentionally not calling window.onRoomSelected here to avoid interacting with the sidebar
            });
        });
    }

    function clearPath() {
        const svg = document.getElementById('map-path-svg'); if (!svg) return;
        Array.from(svg.querySelectorAll('.route, .map-marker, .moving-dot')).forEach(n => n.remove());
        document.querySelectorAll('.map-room').forEach(r => r.classList.remove('start-point','end-point','on-path'));
        state.startRoom = null; state.endRoom = null;
    }

    function drawPath(fromRoomId, toRoomId) {
        const rooms = window.floorData && window.floorData[state.currentFloor] && window.floorData[state.currentFloor].rooms ? window.floorData[state.currentFloor].rooms : [];
        const fromRoom = rooms.find(r => r.id === fromRoomId); const toRoom = rooms.find(r => r.id === toRoomId);
        if (!fromRoom || !toRoom) return;
        const svg = document.getElementById('map-path-svg'); if (!svg) return; clearPath();
        const fromCenter = { x: fromRoom.x + fromRoom.w / 2, y: fromRoom.y + fromRoom.h / 2 }; const toCenter = { x: toRoom.x + toRoom.w / 2, y: toRoom.y + toRoom.h / 2 };
        let points = getPathPoints(state.currentFloor, fromCenter, toCenter, fromRoomId, toRoomId);
        if (!points || points.length < 2) {
            const gridResult = findGridPath(state.currentFloor, fromCenter, toCenter);
            if (gridResult && gridResult.points && gridResult.points.length >= 2) { points = gridResult.points; }
        }
        let pathData = '';
        if (!points || points.length < 2) { pathData = `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`; }
        else { const simple = simplifyPoints(points); pathData = pointsToSmoothPath(simple); }

        const path = document.createElementNS('http://www.w3.org/2000/svg','path'); const pathId = 'route-' + Date.now();
        path.setAttribute('d', pathData); path.setAttribute('class', 'map-route route'); path.setAttribute('marker-end','url(#arrowhead)'); svg.appendChild(path);

        const startMarker = document.createElementNS('http://www.w3.org/2000/svg','circle'); startMarker.setAttribute('cx', fromCenter.x); startMarker.setAttribute('cy', fromCenter.y); startMarker.setAttribute('r','1.6'); startMarker.setAttribute('class','map-marker map-marker-start'); svg.appendChild(startMarker);
        const endMarker = document.createElementNS('http://www.w3.org/2000/svg','circle'); endMarker.setAttribute('cx', toCenter.x); endMarker.setAttribute('cy', toCenter.y); endMarker.setAttribute('r','1.6'); endMarker.setAttribute('class','map-marker map-marker-end'); svg.appendChild(endMarker);

        const mover = document.createElementNS('http://www.w3.org/2000/svg','circle'); mover.setAttribute('r','1.2'); mover.setAttribute('class','map-moving-dot moving-dot'); const anim = document.createElementNS('http://www.w3.org/2000/svg','animateMotion'); anim.setAttribute('dur','2s'); anim.setAttribute('repeatCount','indefinite'); const mpath = document.createElementNS('http://www.w3.org/2000/svg','mpath'); mpath.setAttributeNS('http://www.w3.org/1999/xlink','href','#' + pathId); anim.appendChild(mpath); mover.appendChild(anim); svg.appendChild(mover);

        const fromEl = document.querySelector(`[data-room-id="${fromRoomId}"]`); const toEl = document.querySelector(`[data_room_id="${toRoomId}"]`) ;
        const toEl2 = document.querySelector(`[data-room-id="${toRoomId}"]`);
        if (fromEl) fromEl.classList.add('on-path'); if (toEl2) toEl2.classList.add('on-path');
    }

    function highlightRoom(roomId) {
        document.querySelectorAll('.map-room').forEach(r => r.classList.remove('highlighted'));
        document.querySelectorAll('.room-item, .map-room-item').forEach(i => i.classList.remove('selected'));
        const mapRoom = document.querySelector(`.map-room[data-room-id="${roomId}"]`);
        if (mapRoom) { mapRoom.classList.add('highlighted'); mapRoom.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        const side = document.querySelector(`.room-item[data-room-id="${roomId}"]`);
        if (side) { side.classList.add('selected'); side.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }

    // API
    window.mapEngine = {
        state,
        renderFloorPlanInto,
        setFloor: function (floor) { state.currentFloor = floor; },
        drawPath,
        clearPath,
        highlightRoom,
        buildGrid,
        findGridPath,
        ensureWaypointFloor: function (floor) { if (!window.waypointGraph) window.waypointGraph = {}; if (!window.waypointGraph[floor]) window.waypointGraph[floor] = { nodes: {}, edges: {} }; }
    };

    console.info('mapEngine loaded');
})();
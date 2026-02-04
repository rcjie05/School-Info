// Custom floor data for floor-plan.html
// This file intentionally sets window.floorData and window.waypointGraph
// so the shared map engine and UI can reuse it without duplicating logic.

window.floorData = {
    ground: {
        name: "Ground Floor",
        rooms: [
            { id: "avp", name: "AVP Office", type: "office", x: 1, y: 10, w: 22.1, h: 15 },
            { id: "college-classroom", name: "College Classroom", type: "classroom", x: 22.9, y: 10, w: 20, h: 15 },
            { id: "computer-lab", name: "Computer Lab", type: "classroom", x: 42.3, y: 10, w: 22, h: 15 },
            { id: "clinic", name: "Clinic", type: "facility", x: 64, y: 10, w: 20, h: 15 },
            
            { id: "bed-office", name: "BED Principal", type: "office", x: 1, y: 30.9, w: 13.1, h: 16 },
            { id: "vp-office", name: "Vice President", type: "office", x: 13.9, y: 30.9, w: 13.1, h: 16 },
            { id: "mis-office", name: "MIS Office", type: "office", x: 44.2, y: 30.8, w: 40, h: 7 },
            { id: "ccti", name: "CCTI", type: "office", x: 84, y: 37.5, w: 15, h: 8 },
            
            { id: "marketing-office", name: "Marketing", type: "office", x: 61.3, y: 37.5, w: 18.6, h: 8 },
            { id: "bsba-office", name: "BSBA Office", type: "office", x: 61.3, y: 45, w: 18.6, h: 8 },
            { id: "guidance-office", name: "Guidance", type: "office", x: 84, y: 45, w: 15, h: 8 },
            
            { id: "registrar", name: "Registrar", type: "office", x: 1, y: 46.3, w: 26, h: 25 },
            { id: "quadrangle", name: "Quadrangle", type: "special", x: 31, y: 37.5, w: 31, h: 33.9 },
            
            { id: "playgroup", name: "Playgroup", type: "classroom", x: 65, y: 57.5, w: 15, h: 7 },
            { id: "Louging-room", name: "Louging Room", type: "facility", x: 65, y: 64, w: 15, h: 7 },
            { id: "CR1", name: "CR 1", type: "facility", x: 84, y: 57.5, w: 15, h: 7 },
            { id: "CR2", name: "CR 2", type: "facility", x: 84, y: 64, w: 15, h: 7 },
            { id: "CR3", name: "CR 3", type: "facility", x: 84, y: 70.7, w: 15, h: 7 },
            { id: "CR4", name: "CR 4", type: "facility", x: 84, y: 77.5, w: 15, h: 7 },
            { id: "CR5", name: "CR 5", type: "facility", x: 84, y: 30.8, w: 15, h: 7 },
            
            { id: "banko-maximo", name: "Banko Maximo", type: "facility", x: 1, y: 82, w: 13.1, h: 17 },
            { id: "hr", name: "HR", type: "office", x: 13.9, y: 82, w: 13.1, h: 17 },
            { id: "chapel", name: "Chapel", type: "special", x: 64, y: 84, w: 35, h: 15 }
        ]
    },
    "2nd": {
        name: "2nd Floor",
        rooms: [
            { id: "room-205", name: "Room 205", type: "classroom", x: 10, y: 20, w: 30, h: 15 },
            { id: "room-204", name: "Room 204", type: "classroom", x: 10, y: 36, w: 18, h: 14 },
            { id: "room-203", name: "Room 203", type: "classroom", x: 10, y: 51, w: 18, h: 14 },
            { id: "room-202", name: "Room 202", type: "classroom", x: 29, y: 51, w: 18, h: 14 },
            { id: "room-201", name: "Room 201", type: "classroom", x: 48, y: 51, w: 18, h: 14 }
        ]
    },
    "3rd": {
        name: "3rd Floor",
        rooms: [
            { id: "room-306", name: "Room 306", type: "classroom", x: 8, y: 8, w: 12, h: 12 },
            { id: "room-307", name: "Room 307", type: "classroom", x: 21, y: 8, w: 12, h: 12 },
            { id: "room-308", name: "Room 308", type: "classroom", x: 34, y: 8, w: 12, h: 12 },
            { id: "room-309", name: "Room 309", type: "classroom", x: 47, y: 8, w: 12, h: 12 },
            { id: "room-310", name: "Room 310", type: "classroom", x: 70, y: 20, w: 20, h: 18 },
            
            { id: "room-305-a", name: "Room 305-A", type: "classroom", x: 8, y: 21, w: 12, h: 8 },
            { id: "room-305-b", name: "Room 305-B", type: "classroom", x: 8, y: 30, w: 12, h: 8 },
            { id: "room-304", name: "Room 304", type: "classroom", x: 8, y: 39, w: 12, h: 15 },
            
            { id: "room-303", name: "Room 303 Lab", type: "classroom", x: 21, y: 52, w: 18, h: 15 },
            { id: "room-302", name: "Room 302 Lab", type: "classroom", x: 40, y: 52, w: 18, h: 15 },
            { id: "room-301", name: "Room 301 Lab", type: "classroom", x: 59, y: 52, w: 18, h: 15 }
        ]
    },
    "4th": {
        name: "4th Floor",
        rooms: [
            { id: "room-407", name: "Room 407", type: "classroom", x: 8, y: 8, w: 15, h: 15 },
            { id: "criminology-dept", name: "Criminology Dept", type: "office", x: 24, y: 8, w: 38, h: 8 },
            { id: "crime-lab", name: "Crime Lab", type: "classroom", x: 63, y: 8, w: 20, h: 15 },
            { id: "room-410", name: "Room 410", type: "classroom", x: 70, y: 24, w: 20, h: 25 },
            
            { id: "resto-bar", name: "Resto Bar", type: "facility", x: 8, y: 24, w: 15, h: 12 },
            { id: "bistro", name: "Bistro", type: "facility", x: 8, y: 37, w: 15, h: 12 },
            
            { id: "college-computer-lab", name: "Computer Lab", type: "classroom", x: 8, y: 50, w: 15, h: 18 },
            { id: "it-dept", name: "IT Dept", type: "office", x: 24, y: 50, w: 15, h: 18 },
            { id: "hm-tm-dept", name: "HM & TM", type: "office", x: 40, y: 50, w: 23, h: 18 },
            { id: "kitchen-1", name: "Kitchen 1", type: "facility", x: 64, y: 50, w: 13, h: 18 }
        ]
    },
    "5th": {
        name: "5th Floor",
        rooms: [
            { id: "av-room-1", name: "AV Room 1", type: "classroom", x: 8, y: 8, w: 22, h: 15 },
            { id: "av-room-2", name: "AV Room 2", type: "classroom", x: 31, y: 8, w: 22, h: 15 },
            { id: "av-room-3", name: "AV Room 3", type: "classroom", x: 54, y: 8, w: 18, h: 15 },
            { id: "room-510", name: "Room 510", type: "classroom", x: 73, y: 24, w: 19, h: 22 },
            
            { id: "hotel-room", name: "Hotel Room", type: "facility", x: 8, y: 24, w: 12, h: 10 },
            { id: "locker-room-5", name: "Locker Room", type: "facility", x: 8, y: 35, w: 12, h: 11 },
            { id: "room-503", name: "Room 503", type: "classroom", x: 8, y: 47, w: 12, h: 21 },
            
            { id: "college-library", name: "Library", type: "facility", x: 21, y: 47, w: 51, h: 21 }
        ]
    },
    "6th": {
        name: "6th Floor",
        rooms: [
            { id: "room-608", name: "Room 608", type: "classroom", x: 8, y: 8, w: 14, h: 10 },
            { id: "room-607", name: "Room 607", type: "classroom", x: 35, y: 8, w: 14, h: 10 },
            { id: "room-606", name: "Room 606", type: "classroom", x: 68, y: 8, w: 14, h: 10 },
            
            { id: "room-609", name: "Room 609", type: "classroom", x: 8, y: 19, w: 17, h: 24 },
            { id: "room-610", name: "Room 610", type: "classroom", x: 26, y: 19, w: 33, h: 24 },
            { id: "room-602", name: "Room 602", type: "classroom", x: 68, y: 19, w: 14, h: 24 },
            
            { id: "room-605", name: "Room 605", type: "classroom", x: 8, y: 44, w: 14, h: 24 },
            { id: "room-604", name: "Room 604", type: "classroom", x: 23, y: 44, w: 14, h: 24 },
            { id: "room-603", name: "Room 603", type: "classroom", x: 38, y: 44, w: 20, h: 24 },
            { id: "room-601", name: "Room 601", type: "classroom", x: 59, y: 44, w: 15, h: 24 }
        ]
    }
};

// Waypoint graph per floor (coordinates in same 0-100 system as rooms).
window.waypointGraph = {
    ground: {
        // Added detailed corridor nodes to follow the hallways (see map)
        nodes: {
            s: { x: 4, y: 5 },    // stairwell (top-left)
            nw: { x: 10, y: 15 },
            nc: { x: 50, y: 10 },
            ne: { x: 85, y: 15 },
            // corridor nodes going around the quadrangle and down to chapel
            topCorridor: { x: 50, y: 22 },   // between top rooms and MIS corridor
            rightUpper: { x: 74, y: 30 },
            rightMid: { x: 74, y: 52 },
            bottomCorridor: { x: 50, y: 78 },
            chapelEntry: { x: 75, y: 78 },
            cl: { x: 15, y: 45 },
            cr: { x: 85, y: 45 },
            mid: { x: 50, y: 55 },
            sw: { x: 15, y: 85 },
            se: { x: 85, y: 85 }
        },
        edges: {
            s: ['nw'],
            nw: ['s', 'nc', 'cl'],
            nc: ['nw', 'ne', 'topCorridor'],
            ne: ['nc', 'cr', 'rightUpper'],
            topCorridor: ['nc', 'rightUpper', 'cl'],
            rightUpper: ['topCorridor', 'rightMid'],
            rightMid: ['rightUpper', 'mid', 'bottomCorridor'],
            cl: ['nw', 'mid', 'sw', 'topCorridor'],
            cr: ['ne', 'mid', 'se'],
            mid: ['cl', 'cr', 'sw', 'se', 'rightMid'],
            bottomCorridor: ['rightMid', 'mid', 'chapelEntry'],
            chapelEntry: ['bottomCorridor', 'se'],
            sw: ['cl', 'mid'],
            se: ['cr', 'mid', 'chapelEntry']
        }
    },
    '2nd': {
        nodes: {
            a: { x: 20, y: 20 },
            b: { x: 50, y: 50 },
            c: { x: 80, y: 50 }
        },
        edges: {
            a: ['b'],
            b: ['a', 'c'],
            c: ['b']
        }
    },
    '3rd': { nodes: {}, edges: {} },
    '4th': { nodes: {}, edges: {} },
    '5th': { nodes: {}, edges: {} },
    '6th': { nodes: {}, edges: {} }
};

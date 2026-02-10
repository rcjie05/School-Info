<?php
/**
 * Routes API Endpoint
 * Manages floor plan routes (CRUD operations)
 */

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';
require_once '../includes/session.php';

try {
    // Require user to be logged in
    requireLogin();

    // Get database connection
    $db = new Database();
    $conn = $db->getConnection();

    // Get user details
    $method = $_SERVER['REQUEST_METHOD'];
    $userRole = getUserRole();
    $userId = getUserId();

    // Create routes table if it doesn't exist
    $createTable = "CREATE TABLE IF NOT EXISTS floor_routes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        start_room VARCHAR(100),
        end_room VARCHAR(100),
        waypoints JSON NOT NULL,
        visible_to_students BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )";
    
    try {
        $conn->exec($createTable);
    } catch (PDOException $e) {
        // Table already exists or other error - continue
    }

    // Route request to appropriate handler
    switch ($method) {
        case 'GET':
            handleGetRoutes($conn, $userRole);
            break;

        case 'POST':
            handleCreateRoute($conn, $userRole, $userId);
            break;

        case 'PUT':
            handleUpdateRoute($conn, $userRole);
            break;

        case 'DELETE':
            handleDeleteRoute($conn, $userRole);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}

/**
 * Get all routes based on user role
 */
function handleGetRoutes($conn, $userRole) {
    try {
        if ($userRole === 'admin') {
            // Admin sees all routes
            $query = "SELECT fr.*, u.full_name as creator_name 
                     FROM floor_routes fr 
                     LEFT JOIN users u ON fr.created_by = u.id 
                     ORDER BY fr.created_at DESC";
            $stmt = $conn->prepare($query);
        } else {
            // Others see only public routes
            $query = "SELECT fr.*, u.full_name as creator_name 
                     FROM floor_routes fr 
                     LEFT JOIN users u ON fr.created_by = u.id 
                     WHERE fr.visible_to_students = TRUE 
                     ORDER BY fr.created_at DESC";
            $stmt = $conn->prepare($query);
        }

        $stmt->execute();
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Decode JSON waypoints
        foreach ($routes as &$route) {
            $route['waypoints'] = json_decode($route['waypoints'], true);
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'routes' => $routes
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Create a new route (admin only)
 */
function handleCreateRoute($conn, $userRole, $userId) {
    // Only admin can create routes
    requireRole(['admin']);

    try {
        // Get input data
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // Validate JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON format'
            ]);
            return;
        }

        // Validate required fields
        if (empty($data['name']) || empty($data['waypoints'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Name and waypoints are required'
            ]);
            return;
        }

        // Prepare insert query
        $query = "INSERT INTO floor_routes 
                  (name, description, start_room, end_room, waypoints, visible_to_students, created_by) 
                  VALUES (:name, :description, :start_room, :end_room, :waypoints, :visible, :created_by)";

        $stmt = $conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':start_room', $data['start_room']);
        $stmt->bindParam(':end_room', $data['end_room']);
        
        $waypoints_json = json_encode($data['waypoints']);
        $stmt->bindParam(':waypoints', $waypoints_json);
        
        $visible = isset($data['visible_to_students']) ? (bool)$data['visible_to_students'] : true;
        $stmt->bindParam(':visible', $visible, PDO::PARAM_BOOL);
        $stmt->bindParam(':created_by', $userId);

        // Execute
        if ($stmt->execute()) {
            http_response_code(201); // Created
            echo json_encode([
                'success' => true,
                'message' => 'Route created successfully',
                'id' => $conn->lastInsertId()
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to create route'
            ]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Update an existing route (admin only)
 */
function handleUpdateRoute($conn, $userRole) {
    // Only admin can update routes
    requireRole(['admin']);

    try {
        // Get input data
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // Validate JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON format'
            ]);
            return;
        }

        // Validate required fields
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Route ID is required'
            ]);
            return;
        }

        // Prepare update query
        $query = "UPDATE floor_routes SET 
                  name = :name, 
                  description = :description, 
                  start_room = :start_room, 
                  end_room = :end_room, 
                  waypoints = :waypoints, 
                  visible_to_students = :visible 
                  WHERE id = :id";

        $stmt = $conn->prepare($query);

        // Bind parameters
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':description', $data['description']);
        $stmt->bindParam(':start_room', $data['start_room']);
        $stmt->bindParam(':end_room', $data['end_room']);
        
        $waypoints_json = json_encode($data['waypoints']);
        $stmt->bindParam(':waypoints', $waypoints_json);
        
        $visible = isset($data['visible_to_students']) ? (bool)$data['visible_to_students'] : true;
        $stmt->bindParam(':visible', $visible, PDO::PARAM_BOOL);
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);

        // Execute
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Route updated successfully'
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to update route'
            ]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}

/**
 * Delete a route (admin only)
 */
function handleDeleteRoute($conn, $userRole) {
    // Only admin can delete routes
    requireRole(['admin']);

    try {
        // Get input data
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // Validate JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON format'
            ]);
            return;
        }

        // Validate required fields
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Route ID is required'
            ]);
            return;
        }

        // Prepare delete query
        $query = "DELETE FROM floor_routes WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);

        // Execute
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Route deleted successfully'
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Failed to delete route'
            ]);
        }

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
}
?>
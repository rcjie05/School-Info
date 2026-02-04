<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../classes/Auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['username']) && isset($data['password'])) {
        $auth = new Auth();
        $result = $auth->login($data['username'], $data['password']);
        echo json_encode($result);
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing credentials']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>

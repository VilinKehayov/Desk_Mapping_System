<?php
// Database Configuration
$host = 'localhost';
$username = 'user';
$password = 'password';
$database = 'desk_mapping_system';

// Create a connection to the database
$connection = new mysqli($host, $username, $password, $database);

// Check the connection
if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
}

// Set the response content type to JSON
header('Content-Type: application/json');

// Handle the API endpoints
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create a new desk
    $postData = json_decode(file_get_contents('php://input'), true);
    $deskName = $postData['desk-name'];
    $deskSymbol = $postData['desk-symbol'];
    $deskPosition = ['left' => 0, 'top' => 0];

    // Insert the new desk into the database
    $insertQuery = "INSERT INTO desks (name, symbol, `left`, `top`) VALUES (?, ?, ?, ?)";
    $stmt = $connection->prepare($insertQuery);
    $stmt->bind_param("ssii", $deskName, $deskSymbol, $deskPosition['left'], $deskPosition['top']);
    if ($stmt->execute()) {
        // Retrieve the inserted desk record
        $lastId = $stmt->insert_id;
        $selectQuery = "SELECT * FROM desks WHERE id = ?";
        $stmt = $connection->prepare($selectQuery);
        $stmt->bind_param("i", $lastId);
        $stmt->execute();
        $result = $stmt->get_result();
        $desk = $result->fetch_assoc();

        // Return the newly created desk as JSON response
        echo json_encode($desk);
    } else {
        // Error occurred while inserting the desk
        echo json_encode(['error' => 'Failed to create desk']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Retrieve all desks
    $selectQuery = "SELECT * FROM desks";
    $result = $connection->query($selectQuery);
    $desks = [];
    while ($row = $result->fetch_assoc()) {
        $desks[] = $row;
    }

    // Return the list of desks as JSON response
    echo json_encode($desks);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update a desk's position
    $deskId = $_GET['id'];
    $newLeft = $_GET['left'];
    $newTop = $_GET['top'];

    // Update the desk's position in the database
    $updateQuery = "UPDATE desks SET `left` = ?, `top` = ? WHERE id = ?";
    $stmt = $connection->prepare($updateQuery);
    $stmt->bind_param("iii", $newLeft, $newTop, $deskId);
    if ($stmt->execute()) {
        // Return a success response
        echo json_encode(['message' => 'Desk position updated']);
    } else {
        // Error occurred while updating the desk
        echo json_encode(['error' => 'Failed to update desk position']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete a desk
    $deskId = $_GET['id'];

    // Delete the desk record from the database
    $deleteQuery = "DELETE FROM desks WHERE id = ?";
    $stmt = $connection->prepare($deleteQuery);
    $stmt->bind_param("i", $deskId);
    if ($stmt->execute()) {
        // Return a success response
        echo json_encode(['message' => 'Desk deleted']);
    } else {
        // Error occurred while deleting the desk
        echo json_encode(['error' => 'Failed to delete desk']);
    }
}

// Close the database connection
$connection->close();
?>

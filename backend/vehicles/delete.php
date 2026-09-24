<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Vehicle ID is required.', [], 400);
}

try {
    $stmt = $pdo->prepare('DELETE FROM vehicles WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, 'Vehicle not found.', [], 404);
    }

    jsonResponse(true, 'Vehicle deleted successfully.', [], 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to delete vehicle: ' . $e->getMessage(), [], 500);
}

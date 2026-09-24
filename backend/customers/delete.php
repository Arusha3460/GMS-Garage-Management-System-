<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(false, 'Customer ID is required.', [], 400);
}

try {
    $stmt = $pdo->prepare('DELETE FROM customers WHERE id = :id');
    $stmt->execute([':id' => $id]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, 'Customer not found.', [], 404);
    }

    jsonResponse(true, 'Customer deleted successfully.', [], 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to delete customer: ' . $e->getMessage(), [], 500);
}

<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$id = (int) ($data['id'] ?? 0);
$plateNumber = trim($data['plate_number'] ?? '');
$vehicleModel = trim($data['vehicle_model'] ?? '');
$vehicleType = trim($data['vehicle_type'] ?? '');
$customerId = (int) ($data['customer_id'] ?? 0);

if ($id <= 0 || $plateNumber === '' || $vehicleModel === '' || $vehicleType === '' || $customerId <= 0) {
    jsonResponse(false, 'Vehicle ID and all fields are required.', [], 400);
}

try {
    $stmt = $pdo->prepare('UPDATE vehicles SET plate_number = :plate_number, vehicle_model = :vehicle_model, vehicle_type = :vehicle_type, customer_id = :customer_id WHERE id = :id');
    $stmt->execute([
        ':plate_number' => $plateNumber,
        ':vehicle_model' => $vehicleModel,
        ':vehicle_type' => $vehicleType,
        ':customer_id' => $customerId,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, 'Vehicle not found.', [], 404);
    }

    jsonResponse(true, 'Vehicle updated successfully.', [], 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to update vehicle: ' . $e->getMessage(), [], 500);
}

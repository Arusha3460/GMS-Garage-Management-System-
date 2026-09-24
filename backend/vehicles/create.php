<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$plateNumber = trim($data['plate_number'] ?? '');
$vehicleModel = trim($data['vehicle_model'] ?? '');
$vehicleType = trim($data['vehicle_type'] ?? '');
$customerId = (int) ($data['customer_id'] ?? 0);

if ($plateNumber === '' || $vehicleModel === '' || $vehicleType === '' || $customerId <= 0) {
    jsonResponse(false, 'All vehicle fields are required.', [], 400);
}

try {
    $stmt = $pdo->prepare('INSERT INTO vehicles (plate_number, vehicle_model, vehicle_type, customer_id) VALUES (:plate_number, :vehicle_model, :vehicle_type, :customer_id)');
    $stmt->execute([
        ':plate_number' => $plateNumber,
        ':vehicle_model' => $vehicleModel,
        ':vehicle_type' => $vehicleType,
        ':customer_id' => $customerId,
    ]);

    $vehicleId = $pdo->lastInsertId();
    jsonResponse(true, 'Vehicle created successfully.', ['id' => (int) $vehicleId], 201);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to create vehicle: ' . $e->getMessage(), [], 500);
}

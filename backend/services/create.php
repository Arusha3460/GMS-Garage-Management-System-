<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$vehicleId = (int) ($data['vehicle_id'] ?? 0);
$serviceDescription = trim($data['service_description'] ?? '');
$tsh = (float) ($data['tsh'] ?? 0);
$status = trim($data['status'] ?? 'Pending');
$serviceDate = trim($data['service_date'] ?? '');

if ($vehicleId <= 0 || $serviceDescription === '' || $tsh <= 0 || $serviceDate === '') {
    jsonResponse(false, 'All service fields are required.', [], 400);
}

$allowedStatuses = ['Pending', 'In Progress', 'Completed'];
if (!in_array($status, $allowedStatuses, true)) {
    jsonResponse(false, 'Status must be Pending, In Progress, or Completed.', [], 400);
}

try {
    $stmt = $pdo->prepare('INSERT INTO services (vehicle_id, service_description, tsh, status, service_date) VALUES (:vehicle_id, :service_description, :tsh, :status, :service_date)');
    $stmt->execute([
        ':vehicle_id' => $vehicleId,
        ':service_description' => $serviceDescription,
        ':tsh' => $tsh,
        ':status' => $status,
        ':service_date' => $serviceDate,
    ]);

    $serviceId = $pdo->lastInsertId();
    jsonResponse(true, 'Service created successfully.', ['id' => (int) $serviceId], 201);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to create service: ' . $e->getMessage(), [], 500);
}

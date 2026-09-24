<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$id = (int) ($data['id'] ?? 0);
$vehicleId = (int) ($data['vehicle_id'] ?? 0);
$serviceDescription = trim($data['service_description'] ?? '');
$tsh = (float) ($data['tsh'] ?? 0);
$status = trim($data['status'] ?? 'Pending');
$serviceDate = trim($data['service_date'] ?? '');

if ($id <= 0 || $vehicleId <= 0 || $serviceDescription === '' || $tsh <= 0 || $serviceDate === '') {
    jsonResponse(false, 'Service ID and all fields are required.', [], 400);
}

$allowedStatuses = ['Pending', 'In Progress', 'Completed'];
if (!in_array($status, $allowedStatuses, true)) {
    jsonResponse(false, 'Status must be Pending, In Progress, or Completed.', [], 400);
}

try {
    $stmt = $pdo->prepare('UPDATE services SET vehicle_id = :vehicle_id, service_description = :service_description, tsh = :tsh, status = :status, service_date = :service_date WHERE id = :id');
    $stmt->execute([
        ':vehicle_id' => $vehicleId,
        ':service_description' => $serviceDescription,
        ':tsh' => $tsh,
        ':status' => $status,
        ':service_date' => $serviceDate,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, 'Service not found.', [], 404);
    }

    jsonResponse(true, 'Service updated successfully.', [], 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to update service: ' . $e->getMessage(), [], 500);
}

<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$customerId = (int) ($data['customer_id'] ?? 0);
$vehicleId = (int) ($data['vehicle_id'] ?? 0);
$amount = (float) ($data['amount'] ?? 0);
$paymentDate = trim($data['payment_date'] ?? '');

if ($customerId <= 0 || $vehicleId <= 0 || $amount <= 0 || $paymentDate === '') {
    jsonResponse(false, 'All payment fields are required.', [], 400);
}

try {
    $stmt = $pdo->prepare('INSERT INTO payments (customer_id, vehicle_id, amount, payment_date) VALUES (:customer_id, :vehicle_id, :amount, :payment_date)');
    $stmt->execute([
        ':customer_id' => $customerId,
        ':vehicle_id' => $vehicleId,
        ':amount' => $amount,
        ':payment_date' => $paymentDate,
    ]);

    $paymentId = $pdo->lastInsertId();
    jsonResponse(true, 'Payment recorded successfully.', ['id' => (int) $paymentId], 201);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to record payment: ' . $e->getMessage(), [], 500);
}

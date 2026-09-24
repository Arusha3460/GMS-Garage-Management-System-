<?php
require_once __DIR__ . '/../db.php';

try {
    $stmt = $pdo->query('SELECT p.*, c.full_name AS customer_name, v.plate_number, v.vehicle_model FROM payments p LEFT JOIN customers c ON c.id = p.customer_id LEFT JOIN vehicles v ON v.id = p.vehicle_id ORDER BY p.payment_date DESC, p.id DESC');
    $payments = $stmt->fetchAll();
    jsonResponse(true, 'Payments retrieved successfully.', $payments, 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to read payments: ' . $e->getMessage(), [], 500);
}

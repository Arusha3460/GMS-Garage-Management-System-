<?php
require_once __DIR__ . '/../db.php';

try {
    $stmt = $pdo->query('SELECT v.*, c.full_name AS customer_name FROM vehicles v LEFT JOIN customers c ON c.id = v.customer_id ORDER BY v.id DESC');
    $vehicles = $stmt->fetchAll();
    jsonResponse(true, 'Vehicles retrieved successfully.', $vehicles, 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to read vehicles: ' . $e->getMessage(), [], 500);
}

<?php
require_once __DIR__ . '/../db.php';

try {
    $stmt = $pdo->query('SELECT s.*, v.plate_number, v.vehicle_model FROM services s LEFT JOIN vehicles v ON v.id = s.vehicle_id ORDER BY s.service_date DESC, s.id DESC');
    $services = $stmt->fetchAll();
    jsonResponse(true, 'Services retrieved successfully.', $services, 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to read services: ' . $e->getMessage(), [], 500);
}

<?php
require_once __DIR__ . '/../db.php';

try {
    $stmt = $pdo->query('SELECT * FROM customers ORDER BY id DESC');
    $customers = $stmt->fetchAll();
    jsonResponse(true, 'Customers retrieved successfully.', $customers, 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to read customers: ' . $e->getMessage(), [], 500);
}

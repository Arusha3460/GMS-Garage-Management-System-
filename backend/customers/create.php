<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();

$fullName = trim($data['full_name'] ?? '');
$phoneNumber = trim($data['phone_number'] ?? '');
$email = trim($data['email'] ?? '');

if ($fullName === '' || $phoneNumber === '' || $email === '') {
    jsonResponse(false, 'All customer fields are required.', [], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Please enter a valid email address.', [], 400);
}

try {
    $stmt = $pdo->prepare('INSERT INTO customers (full_name, phone_number, email) VALUES (:full_name, :phone_number, :email)');
    $stmt->execute([
        ':full_name' => $fullName,
        ':phone_number' => $phoneNumber,
        ':email' => $email,
    ]);

    $customerId = $pdo->lastInsertId();
    jsonResponse(true, 'Customer created successfully.', ['id' => (int) $customerId], 201);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to create customer: ' . $e->getMessage(), [], 500);
}

<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$id = (int) ($data['id'] ?? 0);
$fullName = trim($data['full_name'] ?? '');
$phoneNumber = trim($data['phone_number'] ?? '');
$email = trim($data['email'] ?? '');

if ($id <= 0 || $fullName === '' || $phoneNumber === '' || $email === '') {
    jsonResponse(false, 'Customer ID and all fields are required.', [], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Please enter a valid email address.', [], 400);
}

try {
    $stmt = $pdo->prepare('UPDATE customers SET full_name = :full_name, phone_number = :phone_number, email = :email WHERE id = :id');
    $stmt->execute([
        ':full_name' => $fullName,
        ':phone_number' => $phoneNumber,
        ':email' => $email,
        ':id' => $id,
    ]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, 'Customer not found.', [], 404);
    }

    jsonResponse(true, 'Customer updated successfully.', [], 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Failed to update customer: ' . $e->getMessage(), [], 500);
}

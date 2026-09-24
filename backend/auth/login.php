<?php
require_once __DIR__ . '/../db.php';

$data = readJsonBody();
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if ($username === '' || $password === '') {
    jsonResponse(false, 'Username and password are required.', [], 400);
}

try {
    $stmt = $pdo->prepare('SELECT * FROM admins WHERE username = :username LIMIT 1');
    $stmt->execute([':username' => $username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        jsonResponse(false, 'Invalid username or password.', [], 401);
    }

    jsonResponse(true, 'Login successful.', [
        'id' => (int) $admin['id'],
        'username' => $admin['username'],
        'full_name' => $admin['full_name'],
    ], 200);
} catch (PDOException $e) {
    jsonResponse(false, 'Login failed: ' . $e->getMessage(), [], 500);
}

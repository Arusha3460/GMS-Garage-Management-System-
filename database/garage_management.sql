CREATE DATABASE IF NOT EXISTS garage_management;
USE garage_management;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL
);

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  customer_id INT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  service_description TEXT NOT NULL,
  tsh DECIMAL(10,2) NOT NULL,
  status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  service_date DATE NOT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

INSERT INTO admins (username, password_hash, full_name) VALUES
('admin', '$2y$10$XqYlRxmrOXo48QTMB.E3JuCKW2xPdTSN86ex5vF4emu.75CjMrWzC', 'Administrator');

INSERT INTO customers (full_name, phone_number, email) VALUES
('David Kriss', '0734567890', 'david.lee@example.com');

INSERT INTO vehicles (plate_number, vehicle_model, vehicle_type, customer_id) VALUES
('T398DXW', 'Toyota VITS', 'Hatchback', 3);

INSERT INTO services (vehicle_id, service_description, tsh, status, service_date) VALUES
(3, 'Battery replacement', 140.00, 'Pending', '2026-09-23');

INSERT INTO payments (customer_id, vehicle_id, amount, payment_date) VALUES
(2, 2, 260.00, '2026-09-22');

-- Tạo các schema cho từng service
CREATE SCHEMA IF NOT EXISTS iam;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS review;
CREATE SCHEMA IF NOT EXISTS ordering;
CREATE SCHEMA IF NOT EXISTS fulfillment;
CREATE SCHEMA IF NOT EXISTS chat;
CREATE SCHEMA IF NOT EXISTS notification;

-- Khởi tạo bảng cơ bản cho IAM Service (Phần của bạn)
CREATE TABLE iam.users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE iam.roles (
    id UUID PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL
);

-- Bảng Outbox để xử lý Eventual Consistency [cite: 1, 22]
CREATE TABLE iam.outbox_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
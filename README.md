# Web-Project - Hệ Thống Quản Lý Bán Hàng (Microservices)

Dự án này được xây dựng theo kiến trúc Microservices, tập trung vào tính mở rộng, bảo mật và khả năng chịu tải cao.

## 🏗 Cấu Trúc Hạ Tầng (Infrastructure)

Hệ thống sử dụng **Docker Compose** để quản lý toàn bộ các thành phần cốt lõi:

* **API Gateway (Nginx):** Cửa ngõ duy nhất (Cổng 80) tiếp nhận và điều hướng request từ Frontend.
* **Database (MySQL 8.0):** Hệ quản trị dữ liệu tập trung, được phân tách thành 7 database độc lập cho từng service.
* **Message Broker (RabbitMQ):** Trung tâm điều phối sự kiện (Events) giữa các dịch vụ theo cơ chế bất đồng bộ.
* **IAM Service (Node.js):** Dịch vụ quản lý định danh và quyền truy cập.

## 🔑 IAM Service (Identity & Access Management)

Dịch vụ này chịu trách nhiệm bảo mật cho toàn bộ hệ thống.

### Tính năng chính:
- **Authentication:** Đăng ký và Đăng nhập sử dụng JWT (JSON Web Token). Mật khẩu được mã hóa bằng `bcryptjs`.
- **Authorization:** Middleware bảo vệ các API nhạy cảm.
- **Outbox Pattern:** Đảm bảo sự kiện `UserCreated` được lưu vào DB và đẩy lên RabbitMQ một cách tin cậy (Atomic Transaction).

### Danh mục API:
- `POST /api/auth/register`: Đăng ký tài khoản mới.
- `POST /api/auth/login`: Đăng nhập lấy Token.
- `GET /api/auth/me`: Lấy thông tin cá nhân (Yêu cầu Header `Authorization: Bearer <token>`).

## 📊 Cơ Sở Dữ Liệu (MySQL)

Hệ thống đã khởi tạo sẵn các database sau:
- `iam`: Lưu trữ người dùng và sự kiện outbox.
- `catalog`: Dữ liệu sản phẩm (Đã tích hợp dữ liệu mẫu).
- `ordering`, `fulfillment`, `review`, `chat`, `notification`: Sẵn sàng cho các service tiếp theo.

## 🚀 Hướng Dẫn Khởi Chạy

Yêu cầu máy cài đặt **Docker** và **Docker Compose**.

1.  **Clone dự án và truy cập thư mục gốc:**
    ```bash
    cd Web-Project
    ```

2.  **Khởi động toàn bộ hệ thống:**
    ```bash
    sudo docker-compose up -d --build
    ```

3.  **Kiểm tra trạng thái:**
    ```bash
    sudo docker-compose ps
    ```

4.  **Truy cập Dashboard RabbitMQ:**
    Địa chỉ: `http://localhost:15672` (User/Pass: `guest` / `guest`).

## 📡 Giao Tiếp Liên Dịch Vụ (Events)

Khi một User được tạo, IAM Service sẽ bắn một sự kiện vào Exchange `microservices_events` trên RabbitMQ. Các service khác (như Notification, Catalog) có thể tạo Queue và bind vào Exchange này để lắng nghe dữ liệu.

---
**Công nghệ:** Node.js, MySQL, RabbitMQ, Nginx, Docker.

# IAM Service

Service quản lý đăng ký, đăng nhập, user và reset mật khẩu.

## Chạy bằng Docker

Từ thư mục root project:

```bash
cd D:\IT\Web-Project
docker-compose up -d --build iam-service
```

Xem logs:

```bash
docker-compose logs -f iam-service
```

Kiểm tra container:

```bash
docker-compose ps iam-service
```

## Chạy server local

```bash
cd D:\IT\Web-Project\backend\apps\iam-service
npm install
npm start
```

## Cấu hình cần có

Trong `.env` hoặc `docker-compose.yml`:

```env
PORT=3001
DB_HOST=mysql
DB_USER=admin
DB_PASS=MySqlSecPass987
DB_NAME=iam
JWT_SECRET=your_secret_32_chars_min
JWT_REFRESH_SECRET=your_refresh_secret_32_chars_min
RABBITMQ_URL=amqp://admin:RabbitMqSecPass321@rabbitmq:5672
RABBITMQ_EXCHANGE=cnweb.events
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Health check

```bash
curl http://localhost:3001/health
```

## Chính

- Đăng ký, đăng nhập, refresh token
- Đổi mật khẩu
- Quên mật khẩu bằng mã 6 số qua email
- Publish events qua RabbitMQ cho email-service
- Endpoint `/users/:id` cho service nội bộ lấy email user

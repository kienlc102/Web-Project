# Email Service

Service gửi email thông báo qua RabbitMQ.

## Chạy bằng Docker

Từ thư mục root project:

```bash
cd D:\IT\Web-Project
docker-compose up -d --build email-service
```

Xem logs:

```bash
docker-compose logs -f email-service
```

Kiểm tra container:

```bash
docker-compose ps email-service
```

## Chạy server local

```bash
cd D:\IT\Web-Project\backend\apps\email-service
npm install
npm start
```

## Cấu hình cần có

Trong `.env` hoặc `docker-compose.yml`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@yourshop.com
EMAIL_FROM_NAME=Your Shop
RABBITMQ_URL=amqp://admin:RabbitMqSecPass321@rabbitmq:5672
RABBITMQ_EXCHANGE=cnweb.events
IAM_BASE_URL=http://iam-service:3001
ORDERING_BASE_URL=http://ordering-service:8083
FRONTEND_URL=http://localhost:5173
```

## Health check

```bash
curl http://localhost:3004/health
```

## Queues đang dùng

- email-service.user-created
- email-service.password-changed
- email-service.password-reset
- email-service.order-placed
- email-service.delivery-updated

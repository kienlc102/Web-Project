# SendGrid Setup Guide

## Tai sao chuyen sang SendGrid?

- Gmail SMTP thuong bi firewall/cloud provider block port 587/465
- SendGrid API dung HTTPS port 443, khong bi chan
- Stable hon cho production/demo server
- Free tier: 100 emails/day

---

## Buoc 1: Dang ky SendGrid (Mien phi)

1. Vao https://signup.sendgrid.com/
2. Dang ky tai khoan mien phi
3. Xac thuc email

---

## Buoc 2: Tao API Key

1. Dang nhap SendGrid
2. Vao Settings → API Keys
3. Click Create API Key
4. Chon Full Access hoac Restricted Access voi quyen Mail Send
5. Copy API Key (chi hien 1 lan, luu lai ngay)

Vi du API Key:
```
SG.xxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

---

## Buoc 3: Verify Sender Email

SendGrid yeu cau verify email nguoi gui truoc khi gui duoc email.

### Cach 1: Single Sender Verification (De nhat, dung cho demo)

1. Vao Settings → Sender Authentication
2. Click Verify a Single Sender
3. Dien thong tin:
   - From Email: ahkey357@gmail.com (hoac email anh muon dung)
   - From Name: Shop System
   - Reply To: (same as From Email)
4. Kiem tra email inbox va click link verify
5. Sau khi verify xong, email nay co the dung lam sender

### Cach 2: Domain Authentication (Chuan hon, can domain rieng)

Neu co domain rieng, verify domain de gui tu bat ky email nao @your-domain.com.

---

## Buoc 4: Cau hinh .env tren server

Tao hoac sua file .env o root project:

```env
# Email Provider: 'sendgrid' hoac 'smtp'
EMAIL_PROVIDER=sendgrid

# SendGrid API Key
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# Email sender (phai la email da verify trong SendGrid)
EMAIL_FROM=ahkey357@gmail.com
EMAIL_FROM_NAME=Shop System

# SMTP config (backup, khong can neu dung SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

Luu y: EMAIL_FROM phai khop voi email da verify trong SendGrid.

---

## Buoc 5: Deploy len server

```bash
cd ~/Web-Project

# Pull code moi
git pull origin main

# Tao/sua .env
nano .env
# (paste config SendGrid o tren)

# Rebuild email-service
docker compose build --no-cache email-service
docker compose up -d email-service

# Kiem tra logs
docker compose logs --tail=100 email-service
```

Ket qua dung:
```
SendGrid API configured
SendGrid API Key configured
Email Service is running on port 3004
```

Neu loi:
```
SendGrid API Key not configured
```
→ Kiem tra lai .env co SENDGRID_API_KEY chua.

---

## Buoc 6: Test email

### Test register user moi:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testsg1","email":"your_real_email@gmail.com","password":"Test123!","role":"CUSTOMER"}'
```

Kiem tra inbox, phai nhan duoc email welcome.

### Test forgot password:

Vao trang web, thu chuc nang "Quen mat khau", nhap email, phai nhan duoc email reset code.

---

## Chuyen lai SMTP (neu can)

Neu muon chuyen lai dung Gmail SMTP:

```env
EMAIL_PROVIDER=smtp
SMTP_USER=ahkey357@gmail.com
SMTP_PASS=lsho bxgi qjkv gmyg
```

Roi rebuild:

```bash
docker compose up -d email-service
```

---

## Troubleshooting

### Loi: "The from address does not match a verified Sender Identity"

Nguyen nhan: EMAIL_FROM chua verify trong SendGrid.

Fix: Vao SendGrid verify lai email sender, hoac doi EMAIL_FROM thanh email da verify.

---

### Loi: "Forbidden"

Nguyen nhan: API Key khong hop le hoac khong co quyen gui mail.

Fix: Tao lai API Key voi Full Access hoac Mail Send permission.

---

### Email vao Spam

Nguyen nhan: SendGrid free tier chua co domain authentication.

Tam thoi: Bao nguoi nhan check spam folder.

Lau dai: Setup Domain Authentication trong SendGrid.

---

## SendGrid Free Tier Limits

- 100 emails/day
- Du cho demo/test
- Neu can nhieu hon, nang cap plan hoac dung provider khac

---

## Ket luan

SendGrid API on dinh hon Gmail SMTP cho server
Khong bi chan boi firewall
De setup va debug
Free tier du dung cho project demo

Neu co van de, check logs:
```bash
docker compose logs --tail=100 email-service
```

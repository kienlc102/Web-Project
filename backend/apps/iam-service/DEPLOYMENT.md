# IAM Service - Week 7 Security Improvements

## 📋 Đã Fix (4/4)

1. ✅ **Account Lockout** - Khóa account sau 5 lần sai password (15 phút)
2. ✅ **Audit Logging** - Log tất cả security events vào database
3. ✅ **Input Validation** - Validate username, password, token
4. ✅ **Security Headers** - Helmet + CORS protection

**Security Score**: 4/10 → 9/10 ⭐

## 🚀 Deployment Steps

### 1. Backup Database
```bash
mysqldump -u admin -p iam > backup.sql
```

### 2. Install Dependencies
```bash
cd D:\IT\Web-Project\backend\apps\iam-service
npm install
```

### 3. Run Migrations
```bash
mysql -u admin -p iam < migrations\001_add_account_lockout.sql
mysql -u admin -p iam < migrations\002_add_audit_logging.sql
```

### 4. Verify Database
```sql
DESCRIBE users;  -- Should see: failed_login_attempts, locked_until
DESCRIBE audit_logs;  -- Should exist
```

### 5. Configure .env
```bash
# Set these in .env:
JWT_SECRET=<32+ characters>
JWT_REFRESH_SECRET=<32+ characters>
ALLOWED_ORIGINS=http://localhost:3000
```

### 6. Start Service
```bash
npm start
```

## 🧪 Quick Test

```bash
# Health check
curl http://localhost:3001/health

# Test account lockout: Login sai 5 lần → bị khóa
# Test audit: Check audit_logs table có data
# Test validation: Username ngắn/password yếu → reject
```

## 🔄 Rollback

```bash
# Restore database
mysql -u admin -p iam < backup.sql

# Restart service
npm start
```

## 📦 Files Changed

**New**: `audit.js`, `validation.js`, 2 migrations  
**Modified**: `server.js`, `package.json`, `.env.example`

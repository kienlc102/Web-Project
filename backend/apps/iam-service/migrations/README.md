# Database Migrations

## Chạy Migrations

```bash
# Windows
mysql -u admin -p iam < migrations\001_add_account_lockout.sql
mysql -u admin -p iam < migrations\002_add_audit_logging.sql

# Linux/Mac
mysql -u admin -p iam < migrations/001_add_account_lockout.sql
mysql -u admin -p iam < migrations/002_add_audit_logging.sql
```

## Verify

```sql
DESCRIBE users;  -- Should see: failed_login_attempts, locked_until
DESCRIBE audit_logs;  -- Should exist
```

## Rollback

```sql
-- Rollback 001
ALTER TABLE users DROP COLUMN failed_login_attempts, DROP COLUMN locked_until;
DROP INDEX idx_users_locked_until ON users;

-- Rollback 002
DROP TABLE audit_logs;
```

const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

// ============================================================================
// [MIDDLEWARE] HỆ THỐNG TRUY VẾT VÀ GHI LOG TẬP TRUNG (CORRELATION ID)
// ============================================================================
const correlationIdMiddleware = (req, res, next) => {
    const incomingId = req.headers['x-request-id'];
    const requestId = incomingId || `local-${crypto.randomUUID()}`;
    
    req.requestId = requestId;

    const startTime = process.hrtime();

    console.log(`\n[▶] INCOMING REQ | ID: [${req.requestId}] | ${req.method} ${req.originalUrl}`);
    console.log(`    ↳ Body: ${JSON.stringify(req.body).substring(0, 100)}...`); 

    res.on('finish', () => {
        const diff = process.hrtime(startTime);
        const duration = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        const status = res.statusCode;
        const statusString = status >= 400 ? `\x1b[31m${status}\x1b[0m` : `\x1b[32m${status}\x1b[0m`;

        console.log(`[◀] OUTGOING RES | ID: [${req.requestId}] | Status: ${statusString} | Time: ${duration}ms`);
    });

    next();
};

app.use(correlationIdMiddleware);

const PORT = process.env.PORT || 3001;

// Tạo kết nối (Pool) tới MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || 'password123',
    database: process.env.DB_NAME || 'iam',
    waitForConnections: true,
    connectionLimit: 10
});

// API Kiểm tra trạng thái & DB
app.get('/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.status(200).json({ 
            status: 'UP', 
            service: 'IAM Service',
            database: 'Connected to MySQL' 
        });
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Healthcheck lỗi:`, error.message);
        res.status(500).json({ status: 'DOWN', error: error.message });
    }
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-microservices';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

// -----------------------------------------
// API Đăng ký (Nâng cấp Outbox Pattern)
// -----------------------------------------
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const conn = await pool.getConnection();
    
    try {
        await conn.beginTransaction();

        const [existing] = await conn.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            await conn.rollback();
            return res.status(400).json({ error: 'Tài khoản đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await conn.query(
            'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)', 
            [userId, username, hashedPassword]
        );

        // ĐIỂM CHÚ Ý 1: Nhúng requestId vào payload lưu trong Database
        const eventId = uuidv4();
        const payload = JSON.stringify({ 
            userId, 
            username, 
            action: 'UserCreated',
            correlationId: req.requestId // <--- Lưu mã truy vết vào đây
        });
        
        await conn.query(
            'INSERT INTO outbox_events (id, event_type, payload) VALUES (?, ?, ?)',
            [eventId, 'UserCreated', payload]
        );

        await conn.commit();
        res.status(201).json({ message: 'Đăng ký thành công và đã ghi nhận sự kiện!', userId });
    } catch (error) {
        await conn.rollback();
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi đăng ký:`, error.message);
        res.status(500).json({ error: error.message });
    } finally {
        conn.release();
    }
});

// -----------------------------------------
// API Đăng nhập (Login)
// -----------------------------------------
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu' });
        }

        const accessToken = jwt.sign(
            { userId: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id }, 
            JWT_REFRESH_SECRET, 
            { expiresIn: '7d' }
        );

        await pool.query('INSERT INTO refresh_tokens (token, user_id) VALUES (?, ?)', [refreshToken, user.id]);

        res.status(200).json({ message: 'Đăng nhập thành công!', accessToken, refreshToken });
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi login:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------
// API Làm mới Token (Refresh Token)
// -----------------------------------------
app.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Không tìm thấy Refresh Token' });

    try {
        const [rows] = await pool.query('SELECT * FROM refresh_tokens WHERE token = ?', [refreshToken]);
        if (rows.length === 0) return res.status(403).json({ error: 'Refresh Token không hợp lệ hoặc đã bị thu hồi' });

        jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, payload) => {
            if (err) return res.status(403).json({ error: 'Refresh Token đã hết hạn' });

            const [users] = await pool.query('SELECT username, role FROM users WHERE id = ?', [payload.userId]);
            if (users.length === 0) return res.status(403).json({ error: 'User không tồn tại' });

            const newAccessToken = jwt.sign(
                { userId: payload.userId, username: users[0].username, role: users[0].role }, 
                JWT_SECRET, 
                { expiresIn: '15m' }
            );

            res.status(200).json({ accessToken: newAccessToken });
        });
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi refresh token:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------
// API Đăng xuất (Logout)
// -----------------------------------------
app.delete('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    try {
        await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
        res.status(204).send();
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi logout:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------
// Middleware: Trạm kiểm soát Token
// -----------------------------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Từ chối truy cập: Không tìm thấy Token' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Từ chối truy cập: Token không hợp lệ hoặc đã hết hạn' });
        req.user = user;
        next();
    });
};

const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== requiredRole) {
            return res.status(403).json({ error: `Từ chối truy cập: Tính năng này yêu cầu quyền ${requiredRole}` });
        }
        next();
    };
};

// -----------------------------------------
// API Lấy thông tin cá nhân (CẦN TOKEN)
// -----------------------------------------
app.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username FROM users WHERE id = ?', [req.user.userId]);
        if (users.length === 0) return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });

        res.status(200).json({ message: 'Truy cập dữ liệu bảo mật thành công!', data: users[0] });
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi get /me:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

const amqp = require('amqplib');

app.get('/admin/dashboard', authenticateToken, authorizeRole('ADMIN'), async (req, res) => {
    res.status(200).json({ message: 'Xin chào sếp! Đây là khu vực quản trị tối cao.', adminInfo: req.user });
});

// -----------------------------------------
// API Đổi mật khẩu (Yêu cầu phải đang đăng nhập)
// -----------------------------------------
app.post('/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu cũ và mới' });
    }

    try {
        const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ error: 'Người dùng không tồn tại' });

        const isValid = await bcrypt.compare(oldPassword, users[0].password_hash);
        if (!isValid) return res.status(401).json({ error: 'Mật khẩu cũ không chính xác' });

        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, userId]);

        res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi đổi mật khẩu:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------
// API Quên mật khẩu (Tạo và gửi mã OTP)
// -----------------------------------------
app.post('/forgot-password', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Vui lòng cung cấp tên đăng nhập' });

    try {
        const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (users.length === 0) {
            // Trả về thành công ảo để chống dò rỉ tài khoản (Security Best Practice)
            return res.status(200).json({ message: 'Nếu tài khoản tồn tại, hệ thống đã gửi OTP.' });
        }

        const userId = users[0].id;
        // Sinh mã OTP 6 số ngẫu nhiên
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); 
        
        // Cài đặt thời hạn OTP là 15 phút kể từ bây giờ
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Xóa các OTP cũ của user này để tránh rác DB
        await pool.query('DELETE FROM password_resets WHERE user_id = ?', [userId]);

        // Lưu OTP mới vào DB
        await pool.query(
            'INSERT INTO password_resets (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
            [userId, otpCode, expiresAt]
        );

        // MÔ PHỎNG GỬI EMAIL (Trong thực tế sẽ dùng Nodemailer, SendGrid, v.v.)
        console.log(`\n[📧 EMAIL MOCK] ID: [${req.requestId}]`);
        console.log(`   ↳ Gửi đến: ${username}`);
        console.log(`   ↳ Nội dung: Mã OTP đặt lại mật khẩu của bạn là: \x1b[33m${otpCode}\x1b[0m`);
        console.log(`   ↳ Hạn sử dụng: 15 phút.\n`);

        res.status(200).json({ message: 'Nếu tài khoản tồn tại, hệ thống đã gửi OTP.' });
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi forgot-password:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------
// API Đặt lại mật khẩu (Dùng mã OTP)
// -----------------------------------------
app.post('/reset-password', async (req, res) => {
    const { username, otpCode, newPassword } = req.body;
    
    if (!username || !otpCode || !newPassword) {
        return res.status(400).json({ error: 'Thiếu thông tin yêu cầu (username, otpCode, newPassword)' });
    }

    try {
        const [users] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(404).json({ error: 'Thông tin không hợp lệ' });
        const userId = users[0].id;

        // Lấy OTP mới nhất của user
        const [resets] = await pool.query(
            'SELECT * FROM password_resets WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', 
            [userId]
        );

        if (resets.length === 0) {
            return res.status(400).json({ error: 'Không tìm thấy yêu cầu đặt lại mật khẩu' });
        }

        const resetRecord = resets[0];

        // Kiểm tra tính hợp lệ của OTP
        if (resetRecord.otp_code !== otpCode) {
            return res.status(401).json({ error: 'Mã OTP không chính xác' });
        }

        // Kiểm tra hạn sử dụng
        if (new Date() > new Date(resetRecord.expires_at)) {
            return res.status(401).json({ error: 'Mã OTP đã hết hạn' });
        }

        // Cập nhật mật khẩu mới
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, userId]);

        // Hủy mã OTP sau khi dùng thành công
        await pool.query('DELETE FROM password_resets WHERE id = ?', [resetRecord.id]);

        // ĐIỂM CHÚ Ý: Bắn sự kiện bảo mật lên RabbitMQ (Ví dụ để gửi cảnh báo đổi mật khẩu)
        const eventId = uuidv4();
        const payload = JSON.stringify({ userId, username, action: 'PasswordReset', correlationId: req.requestId });
        await pool.query('INSERT INTO outbox_events (id, event_type, payload) VALUES (?, ?, ?)', [eventId, 'UserSecurityChanged', payload]);

        res.status(200).json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại!' });
    } catch (error) {
        console.error(`[❌ ERROR] ID: [${req.requestId}] - Lỗi reset-password:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------
// Background Worker: Gửi sự kiện từ Outbox lên RabbitMQ
// -----------------------------------------
async function startOutboxProcessor() {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        const conn = await amqp.connect(rabbitUrl);
        const channel = await conn.createChannel();
        
        const exchangeName = 'microservices_events';
        await channel.assertExchange(exchangeName, 'fanout', { durable: true });

        console.log('✅ Bưu tá Outbox đã kết nối với RabbitMQ');

        setInterval(async () => {
            try {
                const [events] = await pool.query('SELECT * FROM outbox_events ORDER BY created_at ASC LIMIT 10');
                
                for (const event of events) {
                    // ĐIỂM CHÚ Ý 2: Lấy Correlation ID từ database ra để gán vào Message
                    const payloadObj = JSON.parse(event.payload);
                    const correlationId = payloadObj.correlationId || `worker-${crypto.randomUUID()}`;

                    const message = JSON.stringify({ id: event.id, type: event.event_type, payload: event.payload });
                    
                    // Gắn Header và CorrelationId cho RabbitMQ
                    channel.publish(exchangeName, '', Buffer.from(message), {
                        persistent: true,
                        messageId: event.id,
                        correlationId: correlationId,
                        headers: {
                            'x-request-id': correlationId,
                            'service-origin': 'iam-service-outbox'
                        }
                    });
                    
                    await pool.query('DELETE FROM outbox_events WHERE id = ?', [event.id]);
                    console.log(`[🐰 RabbitMQ] ID: [${correlationId}] - Đã gửi sự kiện: ${event.event_type}`);
                }
            } catch (err) {
                // Chỉ in log nhẹ nhàng nếu DB chưa kịp lên
                console.error('⚠️ Đang đợi Database khởi động để quét Outbox...');
            }
        }, 5000);

    } catch (error) {
        console.error('Lỗi kết nối RabbitMQ, sẽ thử lại sau...', error.message);
    }
}

// Khởi động bưu tá
startOutboxProcessor();

app.listen(PORT, () => {
    console.log(`IAM Service is running on port ${PORT}`);
});
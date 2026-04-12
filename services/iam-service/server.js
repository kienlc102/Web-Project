
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// API Kiểm tra trạng thái service (Health Check)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'IAM Service' });
});

// Khung API Đăng nhập (Sẽ kết nối DB sau)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // TODO: Truy vấn schema IAM [cite: 19] để verify user
    res.status(200).json({ message: 'Login endpoint is ready for implementation' });
});

app.listen(PORT, () => {
    console.log(`IAM Service is running on port ${PORT}`);
});
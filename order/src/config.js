const config = {
  port: Number(process.env.PORT || 8083),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASS || "password123",
    database: process.env.DB_NAME || "microservices_db",
    max: Number(process.env.DB_POOL_MAX || 10),
  },
};

module.exports = config;

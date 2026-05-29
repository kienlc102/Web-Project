const express = require("express");
const cors = require("cors");
const config = require("./config");
const { getPool } = require("./db/postgres");
const cartsRouter = require("./routes/carts");
const ordersRouter = require("./routes/orders");
const internalRouter = require("./routes/internal");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "ordering-service",
    message: "Ordering service is running",
    endpoints: {
      health: "/health",
      carts: "/api/v1/carts",
      orders: "/api/v1/orders",
      internal: "/api/v1/internal",
    },
  });
});

app.get("/health", async (req, res) => {
  try {
    await getPool().query("SELECT 1");
    res.json({
      service: "ordering-service",
      status: "ok",
      db: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      service: "ordering-service",
      status: "error",
      db: "unreachable",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api/v1/carts", cartsRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/internal", internalRouter);

app.use(errorHandler);

module.exports = app;

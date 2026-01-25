require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const connectDB = require("./config/db.config");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// DB Connect
connectDB();

// Routes
app.get("/healthz", (req, res) => {
  res.send("MarketMind4U Backend Running...");
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/subscription", require("./routes/subscription.routes"));
app.use('/api/webhook', require('./routes/webhook.routes'));
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/leads", require("./routes/lead.routes"));
app.use("/api/plans", require("./routes/plan.routes"));

// Server Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

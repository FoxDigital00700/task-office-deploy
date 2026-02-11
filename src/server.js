import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import employeeRoutes from "./routes/employee.js";
import workLogRoutes from "./routes/workLogs.js";
import attendanceRoutes from "./routes/attendance.js";
import leaveRoutes from "./routes/leave.js";
import optionRoutes from "./routes/options.js";
import internalRoutes from "./routes/internal.routes.js";
import seedSuperAdmin from "./seedSuperAdmin.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

connectDB().then(() => {
  seedSuperAdmin();
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5500",
  "https://taskmanageroffice.netlify.app",
  "https://task-office-deploy.onrender.com",
  process.env.CLIENT_URL
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /\.netlify\.app$/.test(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = new Server(httpServer, {
  cors: corsOptions
});


app.use(cors(corsOptions));

// Add Private Network Access header for Chrome
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Private-Network", "true");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).json({});
  }
  next();
});
app.use(express.json());

// Store io instance in app
app.set("io", io);

// Middleware (optional, if we want req.io, but app.get is safer)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});


// Import Chat Routes
import channelRoutes from "./routes/channel.routes.js";
import messageRoutes from "./routes/message.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/work-logs", workLogRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/internal", internalRoutes); // Mounted Internal API

// Chat Routes
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_channel", (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel: ${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

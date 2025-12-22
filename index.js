const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const cors = require("cors");
const app = express();

const { inisialisasiSocketChat } = require("./socket/socket");

require("dotenv").config();
const koneksiMongo = require("./database/koneksiMongo");
koneksiMongo();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

console.log(process.env.LINK_FE);

const allowedOrigins = process.env.LINK_FE
  ? process.env.LINK_FE.split(",").map(o => o.trim())
  : [];

// biasalah untuk api
app.use(cors({
  origin: (origin, callback) => {
    console.log("📍 Request dari origin:", origin);
    
    // Request dari server/postman (tidak ada origin)
    if (!origin) {
      console.log("✅ No origin (Postman/Server) - ALLOWED");
      return callback(null, true); // ← UBAH JADI true
    }

    // Cek apakah origin ada di whitelist
    if (allowedOrigins.includes(origin)) {
      console.log("✅ Origin allowed:", origin);
      return callback(null, true); // ← UBAH JADI true
    }

    // Origin tidak diizinkan
    console.log("❌ Origin rejected:", origin);
    return callback(new Error("CORS_NOT_ALLOWED"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json());

// untuk socket yang khusus ip fe tertentu
// const allowedOrigins = [
//   "https://anonymous-chat-fe-ten.vercel.app",
//   "http://localhost:5173" // tambah ini agar bisa di dev
// ];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});


/* 🔐 SOCKET AUTH MIDDLEWARE */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("NO_AUTH"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId; // ← ini penting
    next();
  } catch {
    next(new Error("INVALID_TOKEN"));
  }
});

// const io = new Server(server, {
//     cors: {
//         origin: "*"
//     }
// });

// front end
// app.use(express.static("public"));

// inisialisasi socket
inisialisasiSocketChat(io);

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/posts", require("./routes/posts.routes"));
app.use("/api/messages", require("./routes/messages.routes"));
app.use("/api/profile", require("./routes/profile.routes"));

server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const cors = require("cors");
const aplikasi = express();

const { inisialisasiSocketChat } = require("./socket/socket");

require("dotenv").config();
const koneksiMongo = require("./database/koneksiMongo");
koneksiMongo();

const PORT = process.env.PORT || 3000;
const server = http.createServer(aplikasi);

console.log(process.env.LINK_FE);

// konfiguurasi cors api
// biasalah untuk api
const originDiizinkan = (process.env.LINK_FE || "")
  .split(",")
  .map(o => o.trim());

aplikasi.use(cors({
  origin: (origin, callback) => {
    // allow server / socket / devtools
    if (!origin) return callback(null, true);

    const cocok = originDiizinkan.some(o =>
      origin.startsWith(o)
    );

    if (cocok) return callback(null, true);

    console.log("❌ CORS API ditolak:", origin);
    callback(null, false); // JANGAN throw Error
  },
  credentials: false, // ⬅️ INI PENTING
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));




aplikasi.use(express.json());

// konfigurasi socket
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (originDiizinkan.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});


// SOCKET MIDDLEWARE
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("NO_AUTH"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    next();
  } catch {
    next(new Error("INVALID_TOKEN"));
  }
});

console.log("JWT:", !!process.env.JWT_SECRET);
console.log("MONGO:", !!process.env.MONGO_URI);
console.log("LINK_FE:", process.env.LINK_FE);


// inisialisasi socket
inisialisasiSocketChat(io);


// routing api
aplikasi.use("/api/autentikasi", require("./rute/autentikasi.routes"));
aplikasi.use("/api/postingan", require("./rute/posts.routes"));
aplikasi.use("/api/pesan", require("./rute/pesan.routes"));
aplikasi.use("/api/profil", require("./rute/profile.routes"));

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
})
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const app = express();

const { inisialisasiSocketChat } = require("./socket/socket");

require("dotenv").config();
const koneksiMongo = require("./database/koneksiMongo");
koneksiMongo();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);


// biasalah untuk api
app.use(cors({ origin: process.env.LINK_FE }));
app.use(express.json());

// untuk socket yang khusus ip fe tertentu
const io = new Server(server, {
    cors: {
        origin: [process.env.LINK_FE],
        methods: ["GET", "POST"]
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


server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})
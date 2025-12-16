const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const cors = require("cors");
const app = express();

const { inisialisasiSocketChat } = require("./socket/chat.socket");


const PORT = process.env.PORT | 3000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// front end
app.use(express.static("public"));

// inisialisasi socket
inisialisasiSocketChat(io);


server.listen(PORT, () => {
    console.log("Server berjalan di http://localost:3000");
})
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("send_message", (data) => {
    console.log("Received:", data);
    io.emit("receive_message", {
        username: data.username,
        text: data.text
      }); // broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from "cors";
import connectDB from './db/index.js';
import dotenv from 'dotenv';

import Message from './models/message.model.js';

dotenv.config({ path: './.env' });

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

// Store users per room
const usersInRoom = {}; // { room: [ { socketId, username } ] }

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  // Save username from frontend
  const username = socket.handshake.auth.username;
  socket.username = username;

  socket.on('join_room', async (room) => {
    socket.join(room);
    socket.room = room;

    // Create room if not exists
    if (!usersInRoom[room]) usersInRoom[room] = [];

    // Avoid duplicate users in list
    const alreadyJoined = usersInRoom[room].some(u => u.socketId === socket.id);
    if (!alreadyJoined) {
      usersInRoom[room].push({ socketId: socket.id, username: socket.username });
    }

    console.log(`${socket.id} joined room: ${room}`);

    // Load previous messages
    const messages = await Message.find({ room }).sort({ time: 1 }).limit(50);
    socket.emit("load_messages", messages);

    // Send updated online user list
    io.to(room).emit("room_users", usersInRoom[room]);
  });

  // Save and broadcast new messages
  socket.on("send_message", async (data) => {
    const newMessage = new Message({
      username: data.username,
      text: data.text,
      room: data.room
    });

    await newMessage.save();

    console.log(`Message from ${data.username} to room ${data.room}: ${data.text}`);

    io.to(data.room).emit("receive_message", {
      username: data.username,
      text: data.text,
      time: newMessage.time
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const room = socket.room;

    if (room && usersInRoom[room]) {
      usersInRoom[room] = usersInRoom[room].filter(
        user => user.socketId !== socket.id
      );

      io.to(room).emit("room_users", usersInRoom[room]);
    }

    console.log("User disconnected:", socket.id);
  });
});

connectDB()
  .then(() => {
    server.listen(5000, () => {
      console.log('Server running on http://localhost:5000');
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!! ", err);
  });

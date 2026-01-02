import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import Connection from "./database/db.js";
import Route from "./routes/routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", Route);

Connection();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

/**
 * userId => Set(socketId)
 */
const onlineUsers = new Map();

/**
 * SOCKET EVENTS
 */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  /**
   * Conversation rooms
   */
  socket.on("join:conversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("leave:conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  /**
   * Presence
   */
  socket.on("user:online", (userId) => {
    socket.userId = userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    const sockets = onlineUsers.get(userId);
    sockets.add(socket.id);

    // emit online only once per user
    if (sockets.size === 1) {
      io.emit("presence:update", {
        userId,
        online: true,
      });
    }
  });

  socket.on("presence:sync", () => {
    socket.emit("presence:state", Array.from(onlineUsers.keys()));
  });

  /**
   * Disconnect
   */
  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (!userId) return;

    const sockets = onlineUsers.get(userId);
    if (!sockets) return;

    sockets.delete(socket.id);

    if (sockets.size === 0) {
      onlineUsers.delete(userId);

      io.emit("presence:update", {
        userId,
        online: false,
      });
    }
  });
});

const PORT = 8000;

server.listen(PORT, () =>
  console.log(`Server is running successfully on PORT ${PORT}`)
);

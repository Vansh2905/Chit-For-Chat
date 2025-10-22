import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { Message, Chat } from "./models/message.js";
import User from "./models/user.js";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_chat", (userData) => {
    users.set(socket.id, userData);
    socket.broadcast.emit("user_joined", userData);
  });

  socket.on("send_message", async (data) => {
    try {
      const messageData = {
        ...data,
        timestamp: new Date(),
        id: Date.now().toString()
      };
      io.emit("receive_message", messageData);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit("user_left", user);
      users.delete(socket.id);
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

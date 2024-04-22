import express from "express";
import cors from "cors";
import "dotenv/config";
import { Server } from "socket.io";
import "./config/connectDB";
import path from "path";
import http from "http";
import postRouter from "./router/Posts";
import authRouter from "./router/Auth";
import friendRouter from "./router/Friend";
import MessageRouter from "./router/MessageRouter";
import Message from "./models/MessageModel";

const app = express();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

app.use((req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} ${
      res.statusCode
    } ${res.get("Content-Length") || "-"} ${
      res.get("X-Response-Time") || "-"
    } ms`
  );
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "assets")));

app.use("/api", authRouter);
app.use("/api/friend", friendRouter);
app.use("/api/posts", postRouter);
app.use("/api/message", MessageRouter);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Join a room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  // Send message to a specific room
  socket.on("sendMessage", async (data) => {
    if (!data.sender || !data.receiver || !data.message || !data.room) {
      console.error("Missing fields", data);
      return;
    }

    try {
      const msg = new Message({
        sender: data.sender,
        receiver: data.receiver,
        message: data.message,
      });
      await msg.save();
      io.to(data.room).emit("receiveMessage", msg);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

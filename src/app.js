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
import MessageRouter from "./models/Message";
import Message from "./models/Message";

const app = express();

const port = process.env.PORT || 3000;
const server = http.createServer(app);

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
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

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", ({ senderId, receiverId }) => {
    socket.join(`${senderId}-${receiverId}`);
  });

  socket.on("chat message", async (msg) => {
    const message = new Message({
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.message,
    });

    await message.save();

    io.to(`${msg.sender}-${msg.receiver}`).emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

import express from "express";
import cors from "cors";
import "dotenv/config";
import { Server } from "socket.io";
import "./config/connectDB";
import path from "path";
import postRouter from "./router/Posts";
import authRouter from "./router/Auth";
import friendRouter from "./router/Friend";
import Message from "./models/Message";

const app = express();

const port = process.env.PORT || 3000;

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

const server = app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("User connected", socket);

  // Handle message events
  socket.on("message", async (data) => {
    try {
      // Save the message to the database
      const message = new Message(data);
      await message.save();

      // Emit the message to the sender and receiver
      socket.emit("message", message);
      io.to(data.receiver).emit("message", message);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

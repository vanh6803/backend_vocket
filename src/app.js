import express from "express";
import cors from "cors";
import "dotenv/config";
import { Server } from "socket.io";
import "./config/connectDB";
import path from "path";
import postRouter from "./router/Posts";
import authRouter from "./router/Auth";

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
app.use("/api/posts", postRouter);

const server = app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

const io = new Server(server);

io.on("connecttion", (socket)=>{
  console.log("user connected: ", socket);

  socket.on("setUser", (userId) => {
    socket.data.userId = userId;
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  
  socket.on("chat message", async (messageData) => {
    try {
      // Kiểm tra xem người nhận có phải là người đúng không
      if (socket.id === messageData.receiverSocketId) {
        // Gửi tin nhắn chỉ đến người nhận
        io.to(messageData.receiverSocketId).emit("chat message", messageData);
      }

      // Kiểm tra xem người gửi có phải là người đúng không
      if (socket.id === messageData.senderSocketId) {
        // Gửi tin nhắn chỉ đến người gửi
        io.to(messageData.senderSocketId).emit("chat message", messageData);
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });
})
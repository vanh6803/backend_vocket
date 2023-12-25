import Message from "../models/Message";
import User from "./../models/User";

export const getMessage = async (req, res, next) => {
  try {
    const { senderId, receiverId } = req.body;

    const sebderExists = await User.exists({ _id: senderId });
    const receiverExists = await User.exists({ _id: receiverId });

    if (!sebderExists || !receiverExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      users: { $all: [senderId, receiverId] },
    }).sort({ createdAt: 1 });

    return res.status(200).json({ result: messages, message: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {}

import mongoose from "mongoose";
import Message from "../models/MessageModel";
import User from "../models/User";

export const getMessage = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getFriendsAndLatestMessages = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id); // Convert user ID to ObjectId format

    const friendsWithMessages = await Message.aggregate([
      {
        // Match messages where the user is either the sender or the receiver
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        // Sort messages by date descending to prepare for fetching the most recent message
        $sort: { createdAt: -1 },
      },
      {
        // Group messages by participants, ignoring who is sender or receiver
        $group: {
          _id: {
            $cond: {
              if: { $lt: ["$sender", "$receiver"] },
              then: {
                $concat: [
                  { $toString: "$sender" },
                  "-",
                  { $toString: "$receiver" },
                ],
              },
              else: {
                $concat: [
                  { $toString: "$receiver" },
                  "-",
                  { $toString: "$sender" },
                ],
              },
            },
          },
          latestMessage: { $first: "$$ROOT" }, // Take the most recent message
        },
      },
      {
        // Determine the friend ID and check who sent the last message
        $project: {
          latestMessage: 1,
          friendId: {
            $cond: {
              if: { $eq: ["$latestMessage.sender", userId] },
              then: "$latestMessage.receiver",
              else: "$latestMessage.sender",
            },
          },
          isUserSender: { $eq: ["$latestMessage.sender", userId] }, // Check if the user is the sender
        },
      },
      {
        // Lookup to fetch details of the friend
        $lookup: {
          from: "users", // Adjust this to match your user collection name
          localField: "friendId",
          foreignField: "_id",
          as: "friendDetails",
        },
      },
      {
        // Unwind the array to simplify access to friend details
        $unwind: {
          path: "$friendDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        // Final projection to format the output
        $project: {
          friendId: "$friendDetails._id",
          friendDetails: {
            _id: "$friendDetails._id",
            fullName: "$friendDetails.fullName",
            avatar: "$friendDetails.avatar",
            email: "$friendDetails.email",
          },
          latestMessageText: "$latestMessage.message",
          latestMessageTime: "$latestMessage.createdAt",
          senderName: {
            $cond: {
              if: "$isUserSender",
              then: "You",
              else: "$friendDetails.fullName",
            },
          },
        },
      },
    ]);

    res.json(friendsWithMessages);
  } catch (error) {
    console.error("Error retrieving friends and messages:", error);
    res.status(500).send("Internal Server Error");
  }
};

import Message from "../models/MessageModel";

export const getMessage = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const userMessaged = async (req, res) => {
  try {
    const latestMessages = await Message.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", req.user._id] },
              then: "$receiver",
              else: "$sender",
            },
          },
          latestMessage: { $first: "$message" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          latestMessage: 1,
          user: {
            fullName: 1,
            email: 1,
            avatar: 1,
          },
        },
      },
    ]);

    res.json(latestMessages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

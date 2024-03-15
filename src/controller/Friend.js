import User from "../models/User";

export const getReceivedFriendRequests = async (req, res) => {
  try {
    const user = req.user;

    // Populate the friend requests with user details
    const friendRequests = await User.find(
      {
        _id: { $in: user.freindRequests },
      },
      "fullName email avatar"
    );

    return res.status(200).json({
      code: 200,
      results: friendRequests,
      message: "Received friend requests retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const getSentFriendRequests = async (req, res) => {
  try {
    const user = req.user;

    // Populate the friend requests with user details
    const sentRequests = await User.find(
      {
        _id: { $in: user.sendFriendRequest },
      },
      "fullName email avatar"
    );

    return res.status(200).json({
      code: 200,
      results: sentRequests,
      message: "Sent friend requests retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const getCurrentFriends = async (req, res) => {
  try {
    const user = req.user;
    // Populate the friends with user details
    const friends = await User.find(
      { _id: { $in: user.friends } },
      "fullName email avatar"
    );

    return res.status(200).json({
      code: 200,
      results: friends,
      message: "Current friends retrieved successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = req.user;

    if (!friendId || friendId.toString() === user._id.toString()) {
      return res.status(400).json({ code: 400, message: "Invalid friendId" });
    }

    const friendUser = await User.findById(friendId);
    if (!friendUser) {
      return res.status(404).json({ code: 404, message: "Friend not found" });
    }

    if (user.sentFriendRequests.includes(friendId)) {
      return res
        .status(400)
        .json({ code: 400, message: "Friend request already sent" });
    }

    // Send the friend request
    user.sentFriendRequests.push(friendId);
    friendUser.freindRequests.push(user._id);
    await friendUser.save();
    await user.save();

    return res
      .status(200)
      .json({ code: 200, message: "Friend request sent successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const searchFriends = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.status(200).json({
        code: 200,
        results: [],
        message: "No search term provided or empty query",
      });
    }

    const searchResults = await User.find(
      {
        $or: [
          { fullName: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      },
      { fullName: 1, email: 1, avatar: 1, friends: 1, freindRequests: 1 }
    );

    return res.status(200).json({
      code: 200,
      results: searchResults,
      message: "Search successful",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = req.user;

    // Kiểm tra xem friendId có tồn tại trong danh sách yêu cầu kết bạn của user không
    if (!user.freindRequests.includes(friendId)) {
      return res
        .status(404)
        .json({ code: 404, message: "Friend request not found" });
    }

    // Chấp nhận yêu cầu kết bạn
    user.freindRequests = user.freindRequests.filter(
      (id) => id.toString() !== friendId.toString()
    );
    user.friends.push(friendId);

    const friendUser = await User.findById(friendId);

    // Chuyển id của user vào danh sách bạn bè của friendUser
    friendUser.friends.push(user._id);

    // Xóa id của user trong danh sách yêu cầu kết bạn của friendUser
    friendUser.sentFriendRequests = friendUser.sentFriendRequests.filter(
      (id) => id.toString() !== user._id.toString()
    );

    await user.save();
    await friendUser.save();

    return res
      .status(200)
      .json({ code: 200, message: "Friend request accepted successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = req.user;

    // Check if the friendId exists in the user's receivedFriendRequests
    if (!user.freindRequests.includes(friendId)) {
      return res
        .status(404)
        .json({ code: 404, message: "Friend request not found" });
    }

    // Reject the friend request
    user.freindRequests = user.freindRequests.filter(
      (id) => id.toString() !== friendId.toString()
    );
    await user.save();

    return res
      .status(200)
      .json({ code: 200, message: "Friend request rejected successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const cancelFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = req.user;

    // Check if the friendId exists in the user's sentFriendRequests
    if (!user.sentFriendRequests.includes(friendId)) {
      return res
        .status(404)
        .json({ code: 404, message: "Friend request not found" });
    }

    // Cancel the friend request
    user.sentFriendRequests = user.sentFriendRequests.filter(
      (id) => id.toString() !== friendId.toString()
    );
    await user.save();

    return res
      .status(200)
      .json({ code: 200, message: "Friend request canceled successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

export const suggestFriends = async (req, res) => {
  try {
    const user = req.user;

    const existingFriendIds = [
      ...user.friends,
      ...user.freindRequests,
      ...user.sentFriendRequests,
    ];

    const suggestedFriends = await User.find(
      {
        _id: { $ne: user._id, $nin: existingFriendIds },
      },
      "fullName email avatar"
    );

    if (suggestedFriends.length === 0) {
      return res.status(200).json({
        code: 200,
        results: suggestedFriends,
        message: "No suggested friends available",
      });
    } else if (suggestedFriends.length <= 3) {
      return res.status(200).json({
        code: 200,
        results: suggestedFriends,
        message: "Suggested friends retrieved successfully",
      });
    } else {
      const randomFriends = suggestedFriends
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);

      return res.status(200).json({
        code: 200,
        results: randomFriends,
        message: "Suggested friends retrieved successfully",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "Internal error" });
  }
};

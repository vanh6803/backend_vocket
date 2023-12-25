import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: String,
    fullName: String,
    email: { type: String, required: true, max: 50 },
    password: { type: String, required: true, min: 8 },
    avatar: { type: String, default: "" },
    token: String,
    freindRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sentFriendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

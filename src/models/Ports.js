import mongoose from "mongoose";

const postsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, max: 50 },
  image: { type: String },
  create_at: { type: Date, default: Date.now() },
});

export default mongoose.model("Posts", postsSchema);

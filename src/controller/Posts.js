import Posts from "../models/Ports";
import fs from "fs";
import moment from "moment-timezone";

export const createPosts = async (req, res) => {
  try {
    const user = req.user;
    const { content } = req.body;
    let image;
    if (req.file) {
      image = `posts/${req.file.filename}`;
    }
    const now = moment().tz("Asia/Ho_Chi_Minh");
    const newPosts = new Posts({
      user_id: user._id,
      content,
      image,
      create_at: now,
    });
    await newPosts.save();
    return res
      .status(201)
      .json({ code: 201, result: newPosts, message: "created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, message: "internal error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Posts.find()
      .sort({ create_at: -1 })
      .populate("user_id");
    return res
      .status(200)
      .json({ code: 200, result: posts, message: "get all post" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Posts.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({ code: 404, message: "not found post" });
    }

    if (post.image) {
      fs.unlinkSync(`src/assets/${post.image}`);
    }

    return res.status(200).json({ code: 200, message: "deleted successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

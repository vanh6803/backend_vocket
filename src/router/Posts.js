import express from "express";
import upload from "../config/uploadConfig";
import { createPosts, getAllPosts, deletePost } from "../controller/Posts";

const router = express.Router();

router.post("/", upload("posts").single("image"), createPosts);
router.get("/", getAllPosts);
router.delete("/:postId", deletePost);

export default router;

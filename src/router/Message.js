import express from "express";
import { checkToken } from "../middleware/index";
import { getMessage, userMessaged } from "../controller/Message";

const router = express.Router();

router.get("/:senderId/:receiverId", getMessage);
router.get("/chats", userMessaged);

export default router;

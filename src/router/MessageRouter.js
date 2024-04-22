import express from "express";
import { checkToken } from "../middleware/index";
import {
  getFriendsAndLatestMessages,
  getMessage,
} from "../controller/MessageController";

const router = express.Router();

router.get("/:senderId/:receiverId", getMessage);
router.get("/friends-messages", checkToken, getFriendsAndLatestMessages);

export default router;

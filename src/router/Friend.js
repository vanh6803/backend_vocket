import express from "express";
import upload from "../config/uploadConfig";
import {
  sendFriendRequest,
  searchFriends,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  suggestFriends,
  getReceivedFriendRequests,
  getCurrentFriends,
} from "../controller/Friend";
import { checkToken } from "../middleware/index";

const router = express.Router();

router.post("/send-friend-request", checkToken, sendFriendRequest);
router.get("/search-friends", searchFriends);
router.put("/accept-friend-request",checkToken, acceptFriendRequest);
router.put("/reject-friend-request",checkToken, rejectFriendRequest);
router.put("/cancel-friend-request",checkToken, cancelFriendRequest);
router.get("/received-friend-requests",checkToken, getReceivedFriendRequests);
router.get("/current-friends",checkToken, getCurrentFriends);
router.get("/suggest-friends",checkToken, suggestFriends);

export default router;

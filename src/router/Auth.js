import express from "express";
import upload from "../config/uploadConfig";
import {
  register,
  login,
  detailUser,
  updateProfile,
  changePassword,
  emailExists,
} from "../controller/Auth";
import { checkToken } from "../middleware/index";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user/detail", checkToken, detailUser);
router.put("/user/update-profile", checkToken, updateProfile);
router.put("/user/change-password", checkToken, changePassword);
router.post("/user/check-email", emailExists);

export default router;

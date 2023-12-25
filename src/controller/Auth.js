import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User";

export const register = async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;
    if (!email) {
      return res.status(403).json({ code: 403, message: "email is required" });
    }
    if (!password) {
      return res.status(403).json({ code: 403, message: "email is password" });
    }
    const salt = await bcrypt.genSalt(10);
    const newUser = new User({ email, password, username, fullName });
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();
    return res
      .status(201)
      .json({ code: 201, message: "create account successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ code: 404, message: "Email not found" });
    }
    // compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ code: 401, message: "Incorrect password" });
    }

    // if password matches, create a new token
    const token = jwt.sign({ userId: user._id }, process.env.PRIVATE_KEY);

    // update token to db
    user.token = token;
    await user.save();
    return res.status(200).json({
      code: 200,
      token,
      message: "login successful",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

export const detailUser = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    return res
      .status(200)
      .json({ code: 200, result: user, message: "get details successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = req.user_id;

    const { username, fullName } = req.body;
    const update = await User.findByIdAndUpdate(
      id,
      { username: username, fullName: fullName },
      { new: true }
    );

    return res.status(200).json({
      code: 200,
      result: update,
      message: "update profile successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const id = req.user_id;
    const { oldPassword, newPassword } = req.body;

    if (oldPassword != newPassword) {
      return res.status(409).json({ code: 409, message: "incorrect password" });
    }

    const salt = await bcrypt.genSalt(10);
    let password = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(id, { password: password }, { new: true });

    return res
      .status(200)
      .json({ code: 200, message: "update password successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

export const emailExists = (req, res) => {
  try {
    const { email } = req.body;
    const existingEmail = User.findOne({ email: email });
    if (existingEmail) {
      return res
        .status(409)
        .json({ code: 409, message: "email already exists" });
    }
    return res.status(200).json({ code: 200, message: "email don't exists" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ code: 500, success: false, message: "internal error" });
  }
};

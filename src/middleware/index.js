import jwt from "jsonwebtoken";
import User from "../models/User";

export const checkToken = async (req, res, next) => {
  let header_token = req.header("Authorization");
  console.log("header_token: ", header_token);
  if (typeof header_token == "undefined" || typeof header_token == null) {
    return res.status(403).json({ message: "unknown token" });
  }

  const token = header_token.replace("Bearer ", "");

  try {
    const data = jwt.verify(token, process.env.PRIVATE_KEY);
    const user = await User.findById(data.userId);
    if (!user) {
      throw new Error("unknown user");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ code: 401, message: error.message });
  }
};

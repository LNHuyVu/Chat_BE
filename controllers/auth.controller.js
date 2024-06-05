import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";
export const signup = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;
    console.log(fullName, username, password, gender);
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match" });
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOne({ username: username });
    if (user) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const boyPic =
      "https://res.cloudinary.com/duhwcwwyo/image/upload/v1710081585/AppChat/OIG2.hkoOgCm_hc7e.0_gynxfl.jpg";
    const girlPic =
      "https://res.cloudinary.com/duhwcwwyo/image/upload/v1710081585/AppChat/OIG1_abwhic.jpg";
    const newUser = new User({
      fullName,
      username,
      password: hashedPassword,
      gender,
      profilePic: gender === "male" ? boyPic : girlPic,
    });
    if (newUser) {
      await generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("body", req.body);
    console.log(username, password);
    const user = await User.findOne({ username });
    const isPassword = await bcrypt.compare(password, user?.password || "");
    console.log(isPassword, user);
    if (!user || !isPassword) {
      return res.status(400).json({
        message: "Invalid username or password",
        error: "Invalid username or password",
      });
    }
    // generateTokenAndSetCookie(user._id, res);
    const token = generateTokenAndSetCookie(user._id);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
      accessToken: token,
    });
  } catch (error) {
    console.log("Error: " + error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.log("Error: " + error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

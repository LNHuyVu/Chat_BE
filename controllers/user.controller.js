import User from "../models/user.model.js";
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggerInUserId = req.user._id;
    const filterInUser = await User.find({
      _id: { $ne: loggerInUserId },
    }).select("-password");
    res.status(200).json(filterInUser);
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

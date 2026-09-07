import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({
    username: username,
  }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { displayName, avatar, bio } = req.body;

  const updates = {};

  if (displayName !== undefined) {
    updates.displayName = displayName;
  }

  if (bio !== undefined) {
    updates.bio = bio;
  }

  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No fields provided for update");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: updates,
    },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});
export { getUserProfile, updateProfile };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.upload.js";
import { cloudinary } from "../config/cloudinary.js";

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

  const { displayName, bio } = req.body;

  const updates = {};

  if (displayName !== undefined) {
    updates.displayName = displayName;
  }

  if (bio !== undefined) {
    updates.bio = bio;
  }

  const userToUpdate = await User.findById(userId);

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "image");
    updates.avatar = result.secure_url;
    updates.avatarPublicId = result.public_id;

    if (userToUpdate.avatarPublicId) {
      await cloudinary.uploader.destroy(userToUpdate.avatarPublicId, {
        resource_type: "image",
      }).catch(err => console.error("Cloudinary cleanup error:", err));
    }
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
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { displayName: { $regex: q, $options: "i" } },
    ],
  })
    .select("username displayName avatar bio")
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { displayName: { $regex: q, $options: "i" } },
    ],
  });

  const totalPages = Math.ceil(totalUsers / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Search users fetched successfully",
    ),
  );
});

export { getUserProfile, updateProfile, searchUsers };

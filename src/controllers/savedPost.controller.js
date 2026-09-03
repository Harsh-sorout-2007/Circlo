import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { SavedPost } from "../models/savedPosts.model.js";

const savePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingSavedPost = await SavedPost.findOne({
    user: userId,
    post: postId,
  });

  if (existingSavedPost) {
    throw new ApiError(409, "Post is already saved");
  }

  const savedPost = await SavedPost.create({
    user: userId,
    post: postId,
  });

  if (!savedPost) {
    throw new ApiError(500, "Something went wrong while saving post");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, savedPost, "Post saved successfully"));
});

const removeSavedPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const savedPost = await SavedPost.findOne({
    user: userId,
    post: postId,
  });

  if (!savedPost) {
    throw new ApiError(404, "Saved Post not found");
  }

  await savedPost.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Saved post removed successfully"));
});

const getSavedPost = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const savedPost = await SavedPost.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("post")
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, savedPost, "Saved Posts fetched successfully"));
});

export { savePost, removeSavedPost, getSavedPost };

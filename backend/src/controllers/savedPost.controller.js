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

  const savedPosts = await SavedPost.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "post",
      populate: [
        { path: "author", select: "username displayName avatar" },
        { path: "community", select: "name icon" }
      ]
    })
    .skip(skip)
    .limit(limit);

  // Extract the actual posts from savedPost documents
  const validPosts = savedPosts
    .map(sp => sp.post)
    .filter(post => post && !post.isRemoved);

  // Import getPostsWithUserState dynamically to avoid circular dependencies if any,
  // or just inline the user state logic here. Since it's saved posts, isSaved is true.
  const { Vote } = await import("../models/vote.model.js");
  const postIds = validPosts.map((post) => post._id);
  const votes = await Vote.find({
    user: userId,
    targetType: "Post",
    target: { $in: postIds },
  }).select("target value").lean();

  const voteMap = new Map(votes.map((vote) => [vote.target.toString(), vote.value]));

  const postsWithState = validPosts.map((post) => ({
    ...post.toObject(),
    userVote: voteMap.get(post._id.toString()) || 0,
    isSaved: true,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, postsWithState, "Saved Posts fetched successfully"));
});

export { savePost, removeSavedPost, getSavedPost };

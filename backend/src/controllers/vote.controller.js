import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { Comment } from "../models/comment.model.js";
import { Vote } from "../models/vote.model.js";
import { Post } from "../models/post.model.js";

const vote = asyncHandler(async (req, res) => {
  const { targetId, targetType, value } = req.body;
  const userId = req.user._id;

  if (targetType !== "Post" && targetType !== "Comment") {
    throw new ApiError(400, "Invalid target type");
  }

  if (value !== 1 && value !== -1) {
    throw new ApiError(400, "Invalid vote value");
  }

  const session = await mongoose.startSession();

  let target;

  try {
    session.startTransaction();

    if (targetType === "Post") {
      const post = await Post.findOne({
        _id: targetId,
        isRemoved: false,
      }).session(session);

      if (!post) {
        throw new ApiError(404, "Post not found");
      }

      target = post;
    } else {
      const comment = await Comment.findOne({
        _id: targetId,
        isRemoved: false,
      }).session(session);

      if (!comment) {
        throw new ApiError(404, "Comment not found");
      }

      target = comment;
    }

    const existingVote = await Vote.findOne({
      user: userId,
      target: targetId,
      targetType,
    }).session(session);

    if (!existingVote) {
      target.score += value;

      await target.save({ session });

      await Vote.create(
        [
          {
            user: userId,
            target: targetId,
            targetType,
            value,
          },
        ],
        { session },
      );
    } else {
      if (existingVote.value === value) {
        throw new ApiError(400, "You already voted in this way");
      }

      const scoreChange = value - existingVote.value;

      target.score += scoreChange;
      existingVote.value = value;

      await target.save({ session });
      await existingVote.save({ session });
    }

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, target, "Vote recorded successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

const removeVote = asyncHandler(async (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.user._id;

  if (targetType !== "Post" && targetType !== "Comment") {
    throw new ApiError(400, "Invalid target type");
  }

  const session = await mongoose.startSession();

  let target;

  try {
    session.startTransaction();

    if (targetType === "Post") {
      const post = await Post.findOne({
        _id: targetId,
        isRemoved: false,
      }).session(session);

      if (!post) {
        throw new ApiError(404, "Post not found");
      }

      target = post;
    } else {
      const comment = await Comment.findOne({
        _id: targetId,
        isRemoved: false,
      }).session(session);

      if (!comment) {
        throw new ApiError(404, "Comment not found");
      }

      target = comment;
    }

    const existingVote = await Vote.findOne({
      user: userId,
      target: targetId,
      targetType,
    }).session(session);

    if (!existingVote) {
      throw new ApiError(404, "Vote not found");
    }

    target.score -= existingVote.value;

    await target.save({ session });
    await existingVote.deleteOne({ session });

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, target, "Vote removed successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export { vote, removeVote };

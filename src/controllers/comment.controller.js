import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";

const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const author = req.user._id;
  const { content, parentCommentId } = req.body;

  if (parentCommentId !== null && parentCommentId !== undefined) {
    const post = await Post.findOne({
      _id: postId,
      isRemoved: false,
    });

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.findOne({
      _id: parentCommentId,
      post: postId,
      isRemoved: false,
    });

    if (!comment) {
      throw new ApiError(404, "Parent comment not found");
    }

    const reply = await Comment.create({
      author,
      post: postId,
      content,
      parentComment: parentCommentId,
    });

    if (!reply) {
      throw new ApiError(
        500,
        "Something went wrong while replying to the comment",
      );
    }

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, reply, "Reply comment created successfully"));
  }

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.create({
    author,
    post: postId,
    content,
  });

  if (!comment) {
    throw new ApiError(500, "Something went wrong while creating comment");
  }

  await Post.findByIdAndUpdate(postId, {
    $inc: { commentCount: 1 },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment created successfully"));
});

const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comments = await Comment.find({
    post: postId,
    isRemoved: false,
  })
    .populate("author", "username displayName avatar")
    .sort({ createdAt: 1 })
    .lean();

  const commentsWithReplies = comments.map((comment) => {
    return { ...comment, replies: [] };
  });

  const commentMap = {};

  commentsWithReplies.forEach((comment) => {
    commentMap[comment._id] = comment;
  });

  commentsWithReplies.forEach((comment) => {
    if (comment.parentComment) {
      const parent = commentMap[comment.parentComment];
      if (!parent) {
        throw new ApiError(404, "Parent not found");
      }
      parent.replies.push(comment);
    }
  });

  const topLevelComments = commentsWithReplies.filter((comment) => {
    return (
      comment.parentComment === null || comment.parentComment === undefined
    );
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, topLevelComments, "Comments fetched successfully"),
    );
});

export { createComment, getComments };

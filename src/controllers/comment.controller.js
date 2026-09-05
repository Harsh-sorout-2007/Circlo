import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { CommunityMember } from "../models/communityMember.model.js";
import { communityRoles } from "../utils/roles.js";

const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, parentComment } = req.body;
  const author = req.user._id;

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.community) {
    const member = await CommunityMember.findOne({
      community: post.community,
      user: author,
      bannedAt: null,
    });

    if (!member) {
      throw new ApiError(
        403,
        "You are banned or not a member of this community",
      );
    }
  }

  if (parentComment) {
    const parent = await Comment.findOne({
      _id: parentComment,
      post: postId,
      isRemoved: false,
    });

    if (!parent) {
      throw new ApiError(404, "Parent comment not found");
    }
  }

  const session = await mongoose.startSession();

  let comment;

  try {
    await session.withTransaction(async () => {
      const createdComments = await Comment.create(
        [
          {
            author,
            post: postId,
            content,
            parentComment: parentComment || null,
          },
        ],
        { session },
      );

      comment = createdComments[0];

      await Post.findByIdAndUpdate(
        postId,
        {
          $inc: { commentCount: 1 },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

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

const updateComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;
  const author = req.user._id;

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.findOne({
    _id: commentId,
    post: postId,
    isRemoved: false,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (!author.equals(comment.author)) {
    throw new ApiError(403, "You do not have permission to update the comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedComment) {
    throw new ApiError(500, "Something went wrong while updating the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user._id;

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = await Comment.findOne({
    _id: commentId,
    post: postId,
    isRemoved: false,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  let canDelete = comment.author.toString() === userId.toString();

  if (!canDelete && post.community) {
    const member = await CommunityMember.findOne({
      community: post.community,
      user: userId,
      bannedAt: null,
    });

    if (
      member &&
      [communityRoles.OWNER, communityRoles.MODERATOR].includes(member.role)
    ) {
      canDelete = true;
    }
  }

  if (!canDelete) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await Comment.findByIdAndUpdate(
        commentId,
        {
          $set: {
            isRemoved: true,
          },
        },
        { session },
      );

      await Post.findByIdAndUpdate(
        postId,
        {
          $inc: { commentCount: -1 },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});
export { createComment, getComments, updateComment, deleteComment };

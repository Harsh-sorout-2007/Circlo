import mongoose from "mongoose";
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
  })
    .populate("author", "username displayName avatar")
    .sort({ createdAt: 1 })
    .lean();

  let userVotesMap = new Map();
  if (req.user) {
    const Vote = mongoose.model("Vote");
    const commentIds = comments.map(c => c._id);
    const votes = await Vote.find({
      user: req.user._id,
      targetType: "Comment",
      target: { $in: commentIds }
    }).select("target value").lean();
    
    votes.forEach(v => userVotesMap.set(v.target.toString(), v.value));
  }

  const commentsWithReplies = comments.map((comment) => {
    return { 
      ...comment, 
      userVote: userVotesMap.get(comment._id.toString()) || 0,
      replies: [] 
    };
  });

  const commentMap = {};

  commentsWithReplies.forEach((comment) => {
    commentMap[comment._id] = comment;
  });

  commentsWithReplies.forEach((comment) => {
    if (comment.parentComment) {
      const parent = commentMap[comment.parentComment];
      if (parent) {
        parent.replies.push(comment);
      }
    }
  });

  const topLevelComments = commentsWithReplies.filter((comment) => {
    return (
      comment.parentComment === null || comment.parentComment === undefined
    );
  });

  const cleanTree = (nodes) => {
    return nodes.filter(node => {
      if (node.replies && node.replies.length > 0) {
        node.replies = cleanTree(node.replies);
      }
      
      if (node.isRemoved) {
        if (!node.replies || node.replies.length === 0) {
          return false;
        }
        node.content = "[This comment was deleted]";
        node.author = null;
      }
      
      return true;
    });
  };

  const finalComments = cleanTree(topLevelComments);

  return res
    .status(200)
    .json(
      new ApiResponse(200, finalComments, "Comments fetched successfully"),
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

      await Post.findOneAndUpdate(
        { _id: postId, commentCount: { $gt: 0 } },
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

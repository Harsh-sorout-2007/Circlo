import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { CommunityMember } from "../models/communityMember.model.js";
import { communityRoles } from "../utils/roles.js";

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

  let membership = null;
  if (post.community) {
    membership = await CommunityMember.findOne({
      user: author,
      community: post.community,
      role: {
        $in: [communityRoles.OWNER, communityRoles.MODERATOR],
      },
    });
  }

  if (!author.equals(comment.author) && !membership) {
    throw new ApiError(403, "You do not have permission to delete the comment");
  }

  const deleteReplies = async (parentCommentId) => {
    const replies = await Comment.find({
      parentComment: parentCommentId,
      isRemoved: false,
    });

    let deleteCount = 0;
    for (const reply of replies) {
      const childCount = await deleteReplies(reply._id);
      deleteCount += childCount;
      await Comment.findByIdAndUpdate(reply._id, {
        $set: {
          isRemoved: true,
        },
      });
      deleteCount++;
    }
    return deleteCount;
  };

  const deleteCount = await deleteReplies(commentId);

  await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        isRemoved: true,
      },
    },
    {
      new: true,
    },
  );

  await Post.findByIdAndUpdate(postId, {
    $inc: { commentCount: -(deleteCount + 1) },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});
export { createComment, getComments, updateComment, deleteComment };

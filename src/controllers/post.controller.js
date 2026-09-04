import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { Community } from "../models/community.model.js";
import { CommunityMember } from "../models/communityMember.model.js";
import { validatePostContent } from "../utils/post.validation.js";
import { communityRoles } from "../utils/roles.js";
import { Comment } from "../models/comment.model.js";
import { Vote } from "../models/vote.model.js";
import { SavedPost } from "../models/savedPosts.model.js";

const createPersonalPost = asyncHandler(async (req, res) => {
  const author = req.user._id;
  const { title, type, content, mediaURL, linkURL } = req.body;

  validatePostContent(type, content, mediaURL, linkURL);

  const post = await Post.create({
    author,
    title,
    type,
    content,
    mediaURL,
    linkURL,
  });

  if (!post) {
    throw new ApiError(500, "Something went wrong while creating post");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully"));
});

const createCommunityPost = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const author = req.user._id;
  const { title, type, content, mediaURL, linkURL } = req.body;

  validatePostContent(type, content, mediaURL, linkURL);

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const validAuthor = await CommunityMember.findOne({
    community: communityId,
    user: author,
  });

  if (!validAuthor) {
    throw new ApiError(403, "Author is not part of community");
  }

  const post = await Post.create({
    author,
    community: communityId,
    title,
    content,
    type,
    mediaURL,
    linkURL,
  });

  if (!post) {
    throw new ApiError(500, "Something went wrong while creating post");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const { title, content, type, mediaURL, linkURL } = req.body;

  const post = await Post.findById(postId);

  if (!post || post.isRemoved) {
    throw new ApiError(404, "Post not found");
  }

  if (!post.author.equals(userId)) {
    if (!post.community) {
      throw new ApiError(403, "You do not have permission to update this post");
    }

    const member = await CommunityMember.findOne({
      community: post.community,
      user: userId,
    });

    if (!member) {
      throw new ApiError(403, "You are not a member of this community");
    }

    if (
      member.role !== communityRoles.OWNER &&
      member.role !== communityRoles.MODERATOR
    ) {
      throw new ApiError(403, "You do not have permission to update this post");
    }
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (type !== undefined) updateData.type = type;
  if (mediaURL !== undefined) updateData.mediaURL = mediaURL;
  if (linkURL !== undefined) updateData.linkURL = linkURL;

  const newType = type !== undefined ? type : post.type;
  const newContent = content !== undefined ? content : post.content;
  const newMediaURL = mediaURL !== undefined ? mediaURL : post.mediaURL;
  const newLinkURL = linkURL !== undefined ? linkURL : post.linkURL;

  validatePostContent(newType, newContent, newMediaURL, newLinkURL);

  const newPost = await Post.findByIdAndUpdate(
    postId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  if (!newPost) {
    throw new ApiError(500, "Something went wrong while updating post");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newPost, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post || post.isRemoved) {
    throw new ApiError(404, "Post not found");
  }

  if (!post.author.equals(userId)) {
    if (!post.community) {
      throw new ApiError(403, "You do not have permission to delete this post");
    }

    const member = await CommunityMember.findOne({
      community: post.community,
      user: userId,
    });

    if (!member) {
      throw new ApiError(403, "You are not a member of this community");
    }

    if (
      member.role !== communityRoles.OWNER &&
      member.role !== communityRoles.MODERATOR
    ) {
      throw new ApiError(403, "You do not have permission to delete this post");
    }
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const comments = await Comment.find({
      post: postId,
    })
      .select("_id")
      .session(session);

    const commentIds = comments.map((comment) => comment._id);

    await Comment.updateMany(
      { post: postId },
      {
        $set: {
          isRemoved: true,
        },
      },
      { session },
    );

    await Vote.deleteMany({
      $or: [
        {
          target: postId,
          targetType: "Post",
        },
        {
          target: { $in: commentIds },
          targetType: "Comment",
        },
      ],
    }).session(session);

    await SavedPost.deleteMany({
      post: postId,
    }).session(session);

    await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          isRemoved: true,
        },
      },
      {
        new: true,
        session,
      },
    );

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Post deleted successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  })
    .populate("author", "username displayName avatar")
    .populate("community", "name icon");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully"));
});

const getCommunityPosts = asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const skip = (page - 1) * limit;

  const sort = req.query.sort || "new";

  if (sort !== "new" && sort !== "top") {
    throw new ApiError(400, "Invalid sort option");
  }

  const sortOption =
    sort === "new" ? { createdAt: -1 } : { score: -1, createdAt: -1 };

  const posts = await Post.find({
    community: communityId,
    isRemoved: false,
  })
    .populate("author", "username displayName avatar")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({
    community: communityId,
    isRemoved: false,
  });

  const totalPages = Math.ceil(totalPosts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Community posts fetched successfully",
    ),
  );
});

const getPersonalPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const posts = await Post.find({
    author: userId,
    community: null,
    isRemoved: false,
  })
    .populate("author", "username displayName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({
    author: userId,
    community: null,
    isRemoved: false,
  });

  const totalPages = Math.ceil(totalPosts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Personal posts fetched successfully",
    ),
  );
});

const getHomeFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sort = req.query.sort || "new";

  if (sort !== "new" && sort !== "top") {
    throw new ApiError(400, "Invalid sort option");
  }

  const sortOption =
    sort === "new" ? { createdAt: -1 } : { score: -1, createdAt: -1 };

  const memberships = await CommunityMember.find({
    user: userId,
    bannedAt: null,
  })
    .select("community")
    .lean();

  const communityIds = memberships.map((membership) => membership.community);

  const posts = await Post.find({
    isRemoved: false,
    $or: [
      {
        community: { $in: communityIds },
      },
      {
        author: userId,
        community: null,
      },
    ],
  })
    .populate("author", "displayName username avatar")
    .populate("community", "name icon")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({
    isRemoved: false,
    $or: [
      {
        community: { $in: communityIds },
      },
      {
        author: userId,
        community: null,
      },
    ],
  });

  const totalPages = Math.ceil(totalPosts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Home feed fetched successfully",
    ),
  );
});

const searchPosts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({
    isRemoved: false,
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
    ],
  })
    .populate("author", "displayName username avatar")
    .populate("community", "name icon")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({
    isRemoved: false,
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
    ],
  });

  const totalPages = Math.ceil(totalPosts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Search posts fetched successfully",
    ),
  );
});

export {
  createPersonalPost,
  createCommunityPost,
  updatePost,
  deletePost,
  getPost,
  getCommunityPosts,
  getPersonalPosts,
  getHomeFeed,
  searchPosts,
};

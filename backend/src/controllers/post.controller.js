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
import { Report } from "../models/report.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.upload.js";
import { cloudinary } from "../config/cloudinary.js";

const createPersonalPost = asyncHandler(async (req, res) => {
  const author = req.user._id;
  const { title, type, content, linkURL } = req.body;

  let mediaURL;
  let mediaPublicId;

  try {
    if (type === "IMAGE" || type === "VIDEO") {
      if (!req.file) {
        throw new ApiError(400, `${type} post requires a media file`);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        type === "VIDEO" ? "video" : "image",
      );

      mediaURL = result.secure_url;
      mediaPublicId = result.public_id;
    }

    validatePostContent(type, content, mediaURL, linkURL);

    const post = await Post.create({
      author,
      title,
      type,
      content,
      mediaURL,
      mediaPublicId,
      linkURL,
    });

    if (!post) {
      throw new ApiError(500, "Something went wrong while creating post");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, post, "Post created successfully"));
  } catch (error) {
    if (mediaPublicId) {
      await cloudinary.uploader.destroy(mediaPublicId, {
        resource_type: type === "VIDEO" ? "video" : "image",
      });
    }

    throw error;
  }
});

const createCommunityPost = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const author = req.user._id;
  const { title, type, content, linkURL } = req.body;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const validAuthor = await CommunityMember.findOne({
    community: communityId,
    user: author,
    bannedAt: null,
  });

  if (!validAuthor) {
    throw new ApiError(403, "You are banned from this community");
  }

  let mediaURL;
  let mediaPublicId;

  try {
    if (type === "IMAGE" || type === "VIDEO") {
      if (!req.file) {
        throw new ApiError(400, `${type} post requires a media file`);
      }

      const result = await uploadToCloudinary(
        req.file.buffer,
        type === "VIDEO" ? "video" : "image",
      );

      mediaURL = result.secure_url;
      mediaPublicId = result.public_id;
    }

    validatePostContent(type, content, mediaURL, linkURL);

    const post = await Post.create({
      author,
      community: communityId,
      title,
      content,
      type,
      mediaURL,
      mediaPublicId,
      linkURL,
    });

    if (!post) {
      throw new ApiError(500, "Something went wrong while creating post");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, post, "Post created successfully"));
  } catch (error) {
    if (mediaPublicId) {
      await cloudinary.uploader.destroy(mediaPublicId, {
        resource_type: type === "VIDEO" ? "video" : "image",
      });
    }

    throw error;
  }
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const { title, content, type, linkURL } = req.body;

  const post = await Post.findById(postId);

  if (!post || post.isRemoved) {
    throw new ApiError(404, "Post not found");
  }

  // Check update permission
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

  const newType = type !== undefined ? type : post.type;
  const newContent = content !== undefined ? content : post.content;
  const newLinkURL = linkURL !== undefined ? linkURL : post.linkURL;

  let newMediaURL = post.mediaURL;
  let newMediaPublicId = post.mediaPublicId;
  let uploadedNewMedia = null;

  // Handle media
  if (newType === "IMAGE" || newType === "VIDEO") {
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        newType === "VIDEO" ? "video" : "image",
      );

      newMediaURL = result.secure_url;
      newMediaPublicId = result.public_id;

      uploadedNewMedia = {
        publicId: result.public_id,
        resourceType: newType === "VIDEO" ? "video" : "image",
      };
    } else if (!post.mediaURL) {
      throw new ApiError(400, `${newType} post requires a media file`);
    } else if (post.type !== newType) {
      throw new ApiError(
        400,
        `Changing from ${post.type} to ${newType} requires a new media file`,
      );
    }
  } else {
    newMediaURL = undefined;
    newMediaPublicId = undefined;
  }

  let newPost;

  try {
    validatePostContent(newType, newContent, newMediaURL, newLinkURL);

    const updateData = {};
    const unsetData = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    if (type !== undefined) {
      updateData.type = type;
    }

    if (linkURL !== undefined) {
      updateData.linkURL = linkURL;
    }

    if (newType === "IMAGE" || newType === "VIDEO") {
      updateData.mediaURL = newMediaURL;
      updateData.mediaPublicId = newMediaPublicId;
    } else {
      unsetData.mediaURL = 1;
      unsetData.mediaPublicId = 1;
    }

    if (newType !== "LINK") {
      unsetData.linkURL = 1;
    }

    const updateQuery = {
      $set: updateData,
    };

    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    newPost = await Post.findByIdAndUpdate(postId, updateQuery, {
      new: true,
      runValidators: true,
    });

    if (!newPost) {
      throw new ApiError(500, "Something went wrong while updating post");
    }
  } catch (error) {
    if (uploadedNewMedia) {
      await cloudinary.uploader.destroy(uploadedNewMedia.publicId, {
        resource_type: uploadedNewMedia.resourceType,
      });
    }

    throw error;
  }

  if (post.mediaPublicId && post.mediaPublicId !== newMediaPublicId) {
    try {
      await cloudinary.uploader.destroy(post.mediaPublicId, {
        resource_type: post.type === "VIDEO" ? "video" : "image",
      });
    } catch (error) {
      console.error("Failed to delete old Cloudinary media:", error);
    }
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

    await Report.deleteMany({
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
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  if (post.mediaPublicId) {
    try {
      await cloudinary.uploader.destroy(post.mediaPublicId, {
        resource_type: post.type === "VIDEO" ? "video" : "image",
      });
    } catch (error) {
      console.error("Failed to clean up Cloudinary media after post deletion:", error);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findOne({
    _id: postId,
    isRemoved: false,
  })
    .populate("author", "username displayName avatar")
    .populate("community", "name icon owner");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const postsWithUserState = await getPostsWithUserState([post], req.user._id);
  const postWithState = postsWithUserState[0];

  return res
    .status(200)
    .json(new ApiResponse(200, postWithState, "Post fetched successfully"));
});

const getPostsWithUserState = async (posts, userId) => {
  const postIds = posts.map((post) => post._id);

  const [votes, savedPosts] = await Promise.all([
    Vote.find({
      user: userId,
      targetType: "Post",
      target: { $in: postIds },
    })
      .select("target value")
      .lean(),

    SavedPost.find({
      user: userId,
      post: { $in: postIds },
    })
      .select("post")
      .lean(),
  ]);

  const voteMap = new Map(
    votes.map((vote) => [vote.target.toString(), vote.value]),
  );

  const savedPostIds = new Set(
    savedPosts.map((savedPost) => savedPost.post.toString()),
  );

  return posts.map((post) => ({
    ...post.toObject(),
    userVote: voteMap.get(post._id.toString()) || 0,
    isSaved: savedPostIds.has(post._id.toString()),
  }));
};

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
    sort === "new"
      ? { createdAt: -1 }
      : { score: -1, createdAt: -1 };

  const posts = await Post.find({
    community: communityId,
    isRemoved: false,
  })
    .populate("author", "username displayName avatar")
    .populate("community", "name icon owner")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const postsWithUserState = await getPostsWithUserState(
    posts,
    req.user._id,
  );

  const totalPosts = await Post.countDocuments({
    community: communityId,
    isRemoved: false,
  });

  const totalPages = Math.ceil(totalPosts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: postsWithUserState,
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
    .populate("community", "name icon owner")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const postsWithUserState = await getPostsWithUserState(
    posts,
    userId,
  );

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
        posts: postsWithUserState,
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
    sort === "new"
      ? { createdAt: -1 }
      : { score: -1, createdAt: -1 };

  const memberships = await CommunityMember.find({
    user: userId,
    bannedAt: null,
  })
    .select("community")
    .lean();

  const communityIds = memberships.map(
    (membership) => membership.community,
  );

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
    .populate("community", "name icon owner")
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  const postsWithUserState = await getPostsWithUserState(
    posts,
    userId,
  );

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
        posts: postsWithUserState,
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
    .populate("community", "name icon owner")
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

  let finalPosts = posts;
  if (req.user) {
    finalPosts = await getPostsWithUserState(posts, req.user._id);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: finalPosts,
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

const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const User = mongoose.model("User");
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const posts = await Post.find({
    author: user._id,
    isRemoved: false,
  })
    .populate("author", "username displayName avatar")
    .populate("community", "name icon owner")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  let postsWithUserState = posts;
  if (req.user) {
    postsWithUserState = await getPostsWithUserState(posts, req.user._id);
  }

  const totalPosts = await Post.countDocuments({
    author: user._id,
    isRemoved: false,
  });

  const totalPages = Math.ceil(totalPosts / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        posts: postsWithUserState,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "User posts fetched successfully",
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
  getUserPosts,
};

import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Community } from "../models/community.model.js";
import { CommunityMember } from "../models/communityMember.model.js";
import { communityRoles } from "../utils/roles.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Vote } from "../models/vote.model.js";
import { SavedPost } from "../models/savedPosts.model.js";
import { Report } from "../models/report.model.js";
import { cloudinary } from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/cloudinary.upload.js";

const createCommunity = asyncHandler(async (req, res) => {
  const { name, description, icon, banner, rules } = req.body;
  const owner = req.user._id;

  const community = await Community.create({
    name,
    description,
    icon,
    banner,
    rules,
    owner: owner,
    memberCount: 1,
  });

  await CommunityMember.create({
    user: owner,
    community: community._id,
    role: communityRoles.OWNER,
    joinedAt: new Date(),
  });

  const createdCommunity = await Community.findById(community._id).populate(
    "owner",
    "displayName username",
  );

  if (!createdCommunity) {
    throw new ApiError(
      500,
      "Something went wrong while creating your community",
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdCommunity, "Community created successfully"),
    );
});

const deleteCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user._id;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  if (community.owner.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "Only the community owner can delete the community",
    );
  }

  const session = await mongoose.startSession();

  let cloudinaryMedia = [];

  try {
    await session.withTransaction(async () => {
      const posts = await Post.find({
        community: communityId,
      })
        .select("_id type mediaPublicId")
        .session(session);

      const postIds = posts.map((post) => post._id);

      cloudinaryMedia = posts
        .filter((post) => post.mediaPublicId)
        .map((post) => ({
          publicId: post.mediaPublicId,
          resourceType: post.type === "VIDEO" ? "video" : "image",
        }));

      const comments = await Comment.find({
        post: { $in: postIds },
      })
        .select("_id")
        .session(session);

      const commentIds = comments.map((comment) => comment._id);

      await Vote.deleteMany({
        $or: [
          {
            targetType: "Post",
            target: { $in: postIds },
          },
          {
            targetType: "Comment",
            target: { $in: commentIds },
          },
        ],
      }).session(session);

      await SavedPost.deleteMany({
        post: { $in: postIds },
      }).session(session);

      await Report.deleteMany({
        $or: [
          {
            targetType: "Post",
            target: { $in: postIds },
          },
          {
            targetType: "Comment",
            target: { $in: commentIds },
          },
        ],
      }).session(session);

      await Comment.deleteMany({
        post: { $in: postIds },
      }).session(session);

      await Post.deleteMany({
        community: communityId,
      }).session(session);

      await CommunityMember.deleteMany({
        community: communityId,
      }).session(session);

      await Community.findByIdAndDelete(communityId).session(session);
    });
  } finally {
    await session.endSession();
  }

  for (const media of cloudinaryMedia) {
    await cloudinary.uploader.destroy(media.publicId, {
      resource_type: media.resourceType,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Community and all associated data deleted successfully",
      ),
    );
});

const getCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const community = await Community.findById(communityId).populate(
    "owner",
    "displayName username",
  );

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  let userRole = null;
  if (req.user) {
    const member = await CommunityMember.findOne({
      community: communityId,
      user: req.user._id,
    });
    if (member) {
      userRole = member.role;
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { ...community.toObject(), userRole }, "Community fetched successfully"));
});

const getCommunityByName = asyncHandler(async (req, res) => {
  const { communityName } = req.params;

  const community = await Community.findOne({
    name: communityName,
  });

  if (!community) {
    throw new ApiError(404, "Community with given name not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        community,
        "Community fetched successfully by name ",
      ),
    );
});

const updateCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const { name, description, rules } = req.body;

  const community = await Community.findOne({
    _id: communityId,
    owner: req.user._id,
  });

  if (!community) {
    throw new ApiError(404, "Community not found or you are not the owner");
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  
  if (rules !== undefined) {
    if (typeof rules === "string") {
      try {
        updateData.rules = JSON.parse(rules);
      } catch {
        updateData.rules = [rules];
      }
    } else {
      updateData.rules = rules;
    }
  }

  if (req.files?.icon && req.files.icon[0]) {
    const result = await uploadToCloudinary(req.files.icon[0].buffer, "image");
    updateData.icon = result.secure_url;
    updateData.iconPublicId = result.public_id;
    if (community.iconPublicId) {
      await cloudinary.uploader.destroy(community.iconPublicId, { resource_type: "image" }).catch(e => console.error(e));
    }
  }

  if (req.files?.banner && req.files.banner[0]) {
    const result = await uploadToCloudinary(req.files.banner[0].buffer, "image");
    updateData.banner = result.secure_url;
    updateData.bannerPublicId = result.public_id;
    if (community.bannerPublicId) {
      await cloudinary.uploader.destroy(community.bannerPublicId, { resource_type: "image" }).catch(e => console.error(e));
    }
  }

  const updatedCommunity = await Community.findByIdAndUpdate(
    communityId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCommunity, "Community updated Successfully"),
    );
});

const joinCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user._id;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const existingMember = await CommunityMember.findOne({
    user: userId,
    community: communityId,
  });

  if (existingMember) {
    if (existingMember.bannedAt) {
      throw new ApiError(403, "You are banned from this community");
    }

    throw new ApiError(409, "You are already a member of this community");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await CommunityMember.create(
        [
          {
            user: userId,
            community: communityId,
            role: communityRoles.MEMBER,
            joinedAt: new Date(),
          },
        ],
        { session },
      );

      await Community.findByIdAndUpdate(
        communityId,
        {
          $inc: { memberCount: 1 },
        },
        {
          session,
          new: true,
        },
      );
    });
  } finally {
    await session.endSession();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Joined community successfully"));
});

const leaveCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user._id;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const member = await CommunityMember.findOne({
    user: userId,
    community: communityId,
  });

  if (!member) {
    throw new ApiError(404, "You are not a member of this community");
  }

  if (member.role === communityRoles.OWNER) {
    throw new ApiError(400, "Community owner cannot leave the community");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await CommunityMember.findByIdAndDelete(member._id).session(session);

      await Community.findByIdAndUpdate(
        communityId,
        {
          $inc: { memberCount: -1 },
        },
        {
          session,
        },
      );
    });
  } finally {
    await session.endSession();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Left community successfully"));
});

const getCommunityMembers = asyncHandler(async (req, res) => {
  const { communityId } = req.params;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const members = await CommunityMember.find({
    community: communityId,
  }).populate("user", "username displayName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, members, "Members fetched successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { communityId, userId } = req.params;
  const requestingUser = req.user._id;
  const { role } = req.body;

  if (role !== communityRoles.MEMBER && role !== communityRoles.MODERATOR) {
    throw new ApiError(400, "Role can only be MEMBER or MODERATOR");
  }

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const requestedMember = await CommunityMember.findOne({
    community: communityId,
    user: requestingUser,
  });

  if (!requestedMember) {
    throw new ApiError(404, "You not a member of community");
  }

  const isOwner = requestedMember.role === communityRoles.OWNER;

  if (!isOwner) {
    throw new ApiError(
      403,
      "you do not have permission to change the member roles",
    );
  }

  const member = await CommunityMember.findOne({
    community: communityId,
    user: userId,
  });

  if (!member) {
    throw new ApiError(404, "User is not member of community");
  }

  if (member.role === communityRoles.OWNER) {
    throw new ApiError(400, "Owner role cannot be changed");
  }

  const updatedMember = await CommunityMember.findByIdAndUpdate(
    member._id,
    {
      $set: {
        role: role,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedMember, "Member role updated successfully"),
    );
});

const removeMember = asyncHandler(async (req, res) => {
  const { communityId, userId } = req.params;
  const requestingUser = req.user._id;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const requester = await CommunityMember.findOne({
    community: communityId,
    user: requestingUser,
    bannedAt: null,
  });

  if (
    !requester ||
    ![communityRoles.OWNER, communityRoles.MODERATOR].includes(requester.role)
  ) {
    throw new ApiError(403, "Only the owner or moderator can remove members");
  }

  const targetMember = await CommunityMember.findOne({
    community: communityId,
    user: userId,
  });

  if (!targetMember) {
    throw new ApiError(404, "Member not found");
  }

  if (targetMember.role === communityRoles.OWNER) {
    throw new ApiError(400, "Community owner cannot be removed");
  }

  if (
    requester.role === communityRoles.MODERATOR &&
    targetMember.role === communityRoles.MODERATOR
  ) {
    throw new ApiError(403, "Moderators cannot remove other moderators");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      await CommunityMember.findByIdAndDelete(targetMember._id, { session });

      await Community.findByIdAndUpdate(
        communityId,
        {
          $inc: { memberCount: -1 },
        },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Member removed successfully"));
});

const banMember = asyncHandler(async (req, res) => {
  const { communityId, userId } = req.params;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const member = await CommunityMember.findOne({
    user: userId,
    community: communityId,
  });

  if (!member) {
    throw new ApiError(404, "Member is not part of community");
  }

  const authMember = await CommunityMember.findOne({
    user: req.user._id,
    community: communityId,
    role: "OWNER",
  });

  if (!authMember) {
    throw new ApiError(403, "You do not have permission to ban this member");
  }

  if (member.role === "OWNER") {
    throw new ApiError(400, "Owner cannot be banned");
  }

  if (member.bannedAt) {
    throw new ApiError(400, "Member is already banned");
  }

  const updateBan = await CommunityMember.findByIdAndUpdate(
    member._id,
    {
      $set: {
        bannedAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updateBan) {
    throw new ApiError(500, "Something went wrong while banning the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateBan, "User banned successfully"));
});

const unbanMember = asyncHandler(async (req, res) => {
  const { communityId, userId } = req.params;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const member = await CommunityMember.findOne({
    user: userId,
    community: communityId,
  });

  if (!member) {
    throw new ApiError(404, "Member is not part of community");
  }

  const authMember = await CommunityMember.findOne({
    user: req.user._id,
    community: communityId,
    role: "OWNER",
  });

  if (!authMember) {
    throw new ApiError(403, "You do not have permission to unban this member");
  }

  if (!member.bannedAt) {
    throw new ApiError(400, "Member is not banned");
  }

  const updatedMember = await CommunityMember.findByIdAndUpdate(
    member._id,
    {
      $set: {
        bannedAt: null,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedMember) {
    throw new ApiError(500, "Something went wrong while unbanning the user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedMember, "User unbanned successfully"));
});

const getAllCommunities = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const communities = await Community.find()
    .select("name description icon memberCount owner")
    .sort({ memberCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCommunities = await Community.countDocuments();
  const totalPages = Math.ceil(totalCommunities / limit);

  let communitiesWithRoles = communities.map(c => ({ ...c.toObject(), userRole: null }));

  if (req.user) {
    const userMemberships = await CommunityMember.find({
      user: req.user._id,
      community: { $in: communities.map(c => c._id) }
    });

    const membershipMap = userMemberships.reduce((acc, curr) => {
      acc[curr.community.toString()] = curr.role;
      return acc;
    }, {});

    communitiesWithRoles = communitiesWithRoles.map(c => ({
      ...c,
      userRole: membershipMap[c._id.toString()] || null
    }));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        communities: communitiesWithRoles,
        pagination: {
          page,
          limit,
          totalCommunities,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Communities fetched successfully"
    )
  );
});

const searchCommunities = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const communities = await Community.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  })
    .select("name description icon memberCount owner")
    .sort({ memberCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalCommunities = await Community.countDocuments({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  });
  
  const totalPages = Math.ceil(totalCommunities / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        communities,
        pagination: {
          page,
          limit,
          totalCommunities,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Communities fetched successfully"
    )
  );
});

export {
  createCommunity,
  getCommunity,
  getAllCommunities,
  getCommunityByName,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateMemberRole,
  removeMember,
  banMember,
  unbanMember,
  searchCommunities,
};

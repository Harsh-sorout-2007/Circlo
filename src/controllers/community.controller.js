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

const createCommunity = asyncHandler(async (req, res) => {
  const { name, description, icon, banner, rules } = req.body;
  const owner = req.user._id;
  const existedCommunity = await Community.findOne({ name });

  if (existedCommunity) {
    throw new ApiError(409, "Community with same name exists");
  }

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

  try {
    await session.withTransaction(async () => {
      const posts = await Post.find({
        community: communityId,
      })
        .select("_id")
        .session(session);

      const postIds = posts.map((post) => post._id);

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

  return res
    .status(200)
    .json(new ApiResponse(200, community, "Community fetched successfully"));
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
  const { name, description, icon, banner, rules } = req.body;

  const community = await Community.findOne({
    _id: communityId,
    owner: req.user._id,
  });

  if (!community) {
    throw new ApiError(404, "Community not found or you are not the owner");
  }

  //handle partial updates
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;
  if (banner !== undefined) updateData.banner = banner;
  if (rules !== undefined) updateData.rules = rules;

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

export {
  createCommunity,
  getCommunity,
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
};

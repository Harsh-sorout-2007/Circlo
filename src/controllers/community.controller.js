import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Community } from "../models/community.model.js";
import { CommunityMember } from "../models/communityMember.model.js";
import { communityRoles } from "../utils/roles.js";

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

  const community = await Community.findOne({
    _id: communityId,
    owner: userId,
  });

  if (!community) {
    throw new ApiError(404, "Community not found or you are not the owner");
  }

  await CommunityMember.deleteMany({
    community: communityId,
  });

  await Community.findByIdAndDelete(communityId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Community deleted successfully"));
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
  const user = req.user._id;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  const existingMember = await CommunityMember.findOne({
    user: user,
    community: communityId,
  });

  if (existingMember) {
    throw new ApiError(409, "You are already a member of this community");
  }

  const member = await CommunityMember.create({
    user: user,
    community: communityId,
    role: communityRoles.MEMBER,
    joinedAt: new Date(),
  });

  if (!member) {
    throw new ApiError(500, "Something went wrong while joining community");
  }

  await Community.findByIdAndUpdate(communityId, {
    $inc: { memberCount: 1 },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, member, "Community joined successfully"));
});

const leaveCommunity = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const user = req.user._id;

  const community = await Community.findById(communityId);

  if (!community) {
    throw new ApiError(404, "Community not found");
  }

  if (isMember.role === COMMUNITY_ROLES.OWNER) {
    throw new ApiError(400, "Community owner cannot leave the community");
  }

  const isMember = await CommunityMember.findOne({
    community: communityId,
    user: user,
  });

  if (!isMember) {
    throw new ApiError(
      404,
      "You are not member of community or community doesnt exist",
    );
  }

  await CommunityMember.deleteOne({
    user: user,
    community: communityId,
  });

  const updatedCommunity = await Community.findByIdAndUpdate(
    communityId,
    {
      $inc: { memberCount: -1 },
    },
    { new: true },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedCommunity,
        "Member left the community successfully",
      ),
    );
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

  const requestedUser = await CommunityMember.findOne({
    community: communityId,
    user: requestingUser,
  });

  if (!requestedUser) {
    throw new ApiError(403, "You are not a part of this community");
  }

  const member = await CommunityMember.findOne({
    community: communityId,
    user: userId,
  });

  if (!member) {
    throw new ApiError(403, "Member is not part of community");
  }

  if (requestedUser.role === communityRoles.MEMBER) {
    throw new ApiError(403, "Members do not have permission to remove users");
  }

  if (
    requestedUser.role === communityRoles.MODERATOR &&
    member.role !== communityRoles.MEMBER
  ) {
    throw new ApiError(403, "Moderators can only remove members");
  }

  if (member.role === communityRoles.OWNER) {
    throw new ApiError(400, "Community owner cannot be removed");
  }

  await CommunityMember.findByIdAndDelete(member._id);

  await Community.findByIdAndUpdate(communityId, {
    $inc: { memberCount: -1 },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User removed from community successfully"));
});

export {
  createCommunity,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updateMemberRole,
  removeMember,
};

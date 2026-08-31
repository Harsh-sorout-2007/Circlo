import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Community } from "../models/community.model.js";
import { CommunityMember } from "../models/communityMember.model.js";

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
    role: "OWNER",
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
export { createCommunity, deleteCommunity };

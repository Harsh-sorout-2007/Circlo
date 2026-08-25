import mongoose, { Schema } from "mongoose";

const communityMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["OWNER", "MODERATOR", "MEMBER"],
    required: true,
  },
  joinedAt: {
    type: Date,
    required: true,
  },
  bannedAt: {
    type: Date,
  },
});

export const CommunityMember = mongoose.model(
  "CommunityMember",
  communityMemberSchema,
);

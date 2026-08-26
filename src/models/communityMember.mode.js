import mongoose, { Schema } from "mongoose";

const communityMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true,
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

communityMemberSchema.index({ user: 1, community: 1 }, { unique: true });

export const CommunityMember = mongoose.model(
  "CommunityMember",
  communityMemberSchema,
);

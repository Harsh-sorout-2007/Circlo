import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
    },
    banner: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    memberCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Community = mongoose.model("Community", communitySchema);

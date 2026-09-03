import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "LINK"],
      required: true,
    },
    mediaURL: {
      type: String,
    },
    linkURL: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({
  isRemoved: 1,
  createdAt: -1,
});

postSchema.index({
  isRemoved: 1,
  score: -1,
  createdAt: -1,
});

postSchema.index({
  community: 1,
  isRemoved: 1,
  createdAt: -1,
});
export const Post = mongoose.model("Post", postSchema);

import mongoose, { Schema } from "mongoose";

const savedPostSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

savedPostSchema.index({ user: 1, post: 1 }, { unique: true });

export const SavedPost = mongoose.model("SavedPost", savedPostSchema);

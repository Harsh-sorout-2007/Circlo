import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: Schema.Types.ObjectId,
      refPath: "targetType",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    value: {
      type: Number,
      enum: [-1, 1],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

voteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

export const Vote = mongoose.model("Vote", voteSchema);

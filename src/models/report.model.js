import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    reporter: {
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

    reason: {
      type: String,
      enum: [
        "SPAM",
        "HARASSMENT",
        "HATE_SPEECH",
        "SEXUAL_CONTENT",
        "VIOLENCE",
        "MISINFORMATION",
        "OTHER",
      ],
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "REVIEWED", "DISMISSED"],
      default: "PENDING",
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

reportSchema.index({ reporter: 1, targetType: 1, target: 1 }, { unique: true });

export const Report = mongoose.model("Report", reportSchema);

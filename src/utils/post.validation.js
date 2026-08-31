import { ApiError } from "./ApiError.js";

export const validatePostContent = (type, content, mediaURL, linkURL) => {
  if (!["TEXT", "IMAGE", "LINK"].includes(type)) {
    throw new ApiError(400, "Invalid post type");
  }

  if (type === "TEXT" && !content) {
    throw new ApiError(400, "Content is required for text posts");
  }

  if (type === "IMAGE" && !mediaURL) {
    throw new ApiError(400, "Media URL is required for image posts");
  }

  if (type === "LINK" && !linkURL) {
    throw new ApiError(400, "Link URL is required for link posts");
  }
};

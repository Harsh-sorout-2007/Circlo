import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Report } from "../models/report.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { CommunityMember } from "../models/communityMember.model.js";

const createReport = asyncHandler(async (req, res) => {
  const reporter = req.user._id;
  const { target, targetType, reason, description } = req.body;

  if (targetType === "Post") {
    const post = await Post.findOne({
      _id: target,
      isRemoved: false,
    });

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (post.author.toString() === reporter.toString()) {
      throw new ApiError(400, "You cannot report your own post");
    }
  } else if (targetType === "Comment") {
    const comment = await Comment.findOne({
      _id: target,
      isRemoved: false,
    });

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.author.toString() === reporter.toString()) {
      throw new ApiError(400, "You cannot report your own comment");
    }
  } else {
    throw new ApiError(400, "Invalid targetType");
  }

  const report = await Report.create({
    reporter,
    target,
    targetType,
    reason,
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, report, "Report created successfully"));
});

const getReports = asyncHandler(async (req, res) => {
  const { communityId } = req.params;
  const userId = req.user._id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const member = await CommunityMember.findOne({
    user: userId,
    community: communityId,
    bannedAt: null,
  });

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (member.role !== "OWNER" && member.role !== "MODERATOR") {
    throw new ApiError(403, "You do not have permission to view reports");
  }

  const posts = await Post.find({
    community: communityId,
  }).select("_id");

  const postIds = posts.map((post) => post._id);

  const postReports = await Report.find({
    targetType: "Post",
    target: { $in: postIds },
  })
    .populate("reporter", "username displayName avatar")
    .populate({
      path: "target",
      select: "title content author community score commentCount createdAt",
      populate: [
        {
          path: "author",
          select: "username displayName avatar",
        },
        {
          path: "community",
          select: "name icon",
        },
      ],
    })
    .sort({ createdAt: -1 });

  const comments = await Comment.find({
    post: { $in: postIds },
  }).select("_id");

  const commentIds = comments.map((comment) => comment._id);

  const commentReports = await Report.find({
    targetType: "Comment",
    target: { $in: commentIds },
  })
    .populate("reporter", "username displayName avatar")
    .populate({
      path: "target",
      select: "content author post score createdAt",
      populate: [
        {
          path: "author",
          select: "username displayName avatar",
        },
        {
          path: "post",
          select: "title author community",
          populate: [
            {
              path: "author",
              select: "username displayName avatar",
            },
            {
              path: "community",
              select: "name icon",
            },
          ],
        },
      ],
    })
    .sort({ createdAt: -1 });

  const reports = [...postReports, ...commentReports];

  reports.sort((a, b) => b.createdAt - a.createdAt);

  const totalReports = reports.length;
  const totalPages = Math.ceil(totalReports / limit);

  const paginatedReports = reports.slice(skip, skip + limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reports: paginatedReports,
        pagination: {
          page,
          limit,
          totalReports,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      "Reports fetched successfully",
    ),
  );
});

const updateReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;
  const userId = req.user._id;

  if (status !== "REVIEWED" && status !== "DISMISSED") {
    throw new ApiError(400, "Invalid status type");
  }

  const report = await Report.findById(reportId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  let communityId;

  if (report.targetType === "Post") {
    const post = await Post.findById(report.target);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    communityId = post.community;
  } else {
    const comment = await Comment.findById(report.target);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    const post = await Post.findById(comment.post);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    communityId = post.community;
  }

  if (!communityId) {
    throw new ApiError(
      403,
      "Reports for personal posts cannot be reviewed by community moderators",
    );
  }

  const member = await CommunityMember.findOne({
    user: userId,
    community: communityId,
    bannedAt: null,
  });

  if (!member) {
    throw new ApiError(403, "You are not member of this community");
  }

  if (member.role !== "OWNER" && member.role !== "MODERATOR") {
    throw new ApiError(403, "You do not have permission to update reports");
  }

  if (report.status !== "PENDING") {
    throw new ApiError(400, "Report has already been handled");
  }

  const updatedReport = await Report.findByIdAndUpdate(
    reportId,
    {
      $set: {
        status: status,
        reviewedBy: userId,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedReport) {
    throw new ApiError(500, "Something went wrong while updating report");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReport, "Report updated successfully"));
});
export { createReport, getReports, updateReport };

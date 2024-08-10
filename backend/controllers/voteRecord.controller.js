// pollId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Poll",
//     required: true,
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   optionIndex: {
//     type: Number, // Index of the option chosen by the voter
//     required: true,
//   },
//   ipAddress: {
//     type: String,
//     required: true,
//   },
//   votedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

import Poll from "../models/poll.schema.js";
import VoteRecord from "../models/voteRecord.schema.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { Option } from "../models/poll.schema.js";

const sendResponse = (status, res, data, message) => {
  res.status(status).json({
    status: "success",
    message: message,
    data,
  });
};

//create vote record
//URL : /api/v1/voteRecord/create
export const castVote = catchAsync(async (req, res) => {
  const { pollId, optionId } = req.body;
  const userId = req.user;

  // Prevent duplicate votes
  // await VoteRecord.preventDuplicateVotes(pollId, userId);

  // Find the poll and option
  let poll = await Poll.findById(pollId);
  let option = await Option.findById(optionId);

  if (!poll || !option) {
    return next(new AppError("Poll or Option not found", 404));
  }

  const containsOption = poll.options.some((optId) => optId.equals(optionId));
  if (!containsOption) {
    return next(new AppError("Option does not belong to this poll", 400));
  }

  // Record the vote
  const newVoteRecord = await VoteRecord.create({
    pollId,
    userId,
    optionId,
    ipAddress: req.ip,
  });

  // Update the vote count for the chosen option
  option = await Option.findByIdAndUpdate(
    optionId,
    { $inc: { votes: 1 } },
    {
      new: true,
    }
  );

  // Now update the total votes for the poll
  poll = await Poll.findByIdAndUpdate(
    pollId,
    { $inc: { totalVotes: 1 } },
    {
      new: true,
    }
  );
  const correctAnswer = poll.correctAnswer;
  const pollTotalVotes = poll.totalVotes; // Updated total votes

  // Use an aggregation pipeline to get all options with their votes and calculate percentage
  const pollOptionsWithVotesAndPercentage = await Option.aggregate([
    {
      $match: {
        _id: { $in: poll.options }, // Match the options that belong to this poll
      },
    },
    {
      $project: {
        _id: 1,
        option: 1,
        votes: 1,
        percentage: {
          $cond: {
            if: { $eq: [pollTotalVotes, 0] }, // Handle division by zero
            then: 0,
            else: {
              $multiply: [{ $divide: ["$votes", pollTotalVotes] }, 100],
            },
          },
        },
      },
    },
  ]);

  sendResponse(
    201,
    res,
    {
      newVoteRecord,
      pollTotalVotes,
      pollOptionsWithVotesAndPercentage,
      correctAnswer,
    },
    "Vote recorded successfully"
  );
});

//get all vote records
//URL : /api/v1/voteRecord/getall
export const getAllVoteRecords = catchAsync(async (req, res, next) => {
  const voteRecords = await VoteRecord.find();
  if (!voteRecords) {
    return next(new AppError("No vote records found", 404));
  }
  sendResponse(200, res, voteRecords, "Vote records fetched successfully");
});

//get vote record with id
//URL : /api/v1/voteRecord/getone/:id
export const getRecordWithId = catchAsync(async (req, res, next) => {
  // Find the vote record by ID and populate the necessary fields
  const voteRecord = await VoteRecord.findById(req.params.id)
    .populate("pollId", "title creator options")
    .populate("userId", "username");

  // If the vote record doesn't exist, return a 404 error
  if (!voteRecord) {
    return next(new AppError("No vote record found with that ID", 404));
  }

  // Flatten the data structure
  const flattenedData = {
    voteRecordId: voteRecord._id,
    pollTitle: voteRecord.pollId.title,
    pollId: voteRecord.pollId._id,
    pollCreatorId: voteRecord.pollId.creator._id,
    pollCreatorUsername: voteRecord.pollId.creator.username,
    pollOptions: voteRecord.pollId.options.map((option) => ({
      optionId: option._id,
      optionText: option.option,
      optionVotes: option.votes,
    })),
    userId: voteRecord.userId._id,
    username: voteRecord.userId.username,
    optionId: voteRecord.optionId,
    ipAddress: voteRecord.ipAddress,
    votedAt: voteRecord.votedAt,
  };

  // Send the flattened data as the response
  sendResponse(200, res, flattenedData, "Vote record fetched successfully");
});

//delete vote record
//URL : /api/v1/voteRecord/delete/:id
export const deleteVoteRecord = catchAsync(async (req, res, next) => {
  const voteRecord = await VoteRecord.findByIdAndDelete(req.params.id);
  if (!voteRecord) {
    return next(new AppError("No vote record found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    message: "Vote record deleted successfully",
  });
});

export const setVoteRecordToZero = catchAsync(async (req, res, next) => {
  const pollId = req.params.pollId;
  const poll = await Poll.findById(pollId);

  if (!poll) {
    return next(new AppError("No poll found with that ID", 404));
  }

  poll.resetPollVotes();
  poll.save();
  sendResponse(200, res, poll, "Poll updated successfully");
});

//middleware

export const voteRecordActiveMiddleware = catchAsync(async (req, res, next) => {
  const pollId = req.body.pollId;
  const poll = await Poll.findById(pollId);
  if (!poll) {
    return next(new AppError("No poll found with that ID", 404));
  }

  if (!poll.isActive) {
    return res.status(400).json({
      status: "fail",
      message: "Poll is not active",
      startTime: poll.startTime,
    });
  }
  next();
});

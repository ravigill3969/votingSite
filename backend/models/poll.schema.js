import mongoose from "mongoose";

// Option Schema
const optionSchema = new mongoose.Schema({
  option: {
    type: String,
    required: [true, "Option is required"],
    minLength: [1, "Option must be at least 1 character"],
  },
  votes: {
    type: Number,
    default: 0,
  },
});

export const Option = mongoose.model("Option", optionSchema);

// Poll Schema
const pollSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  options: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Option",
    },
  ],
  correctAnswer: {
    type: String,
    required: true,
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  totalVotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

//always populate options
pollSchema.pre(/^find/, function (next) {
  this.populate("options", "option votes").populate("creator", "username");
  next();
});

pollSchema.methods.isPollActive = function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
};

pollSchema.methods.resetPollVotes = async function () {
  await Option.updateMany(
    { _id: { $in: this.options } },
    { $set: { votes: 0 } }
  );
  this.totalVotes = 0;
  return this.save();
};

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;

import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { // Changed from 'title' to 'name'
      type: String,
      required: true,
    },
    targetCalories: { // Changed from 'targetValue' to 'targetCalories'
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: { // Changed from 'deadline' to 'endDate'
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", GoalSchema);
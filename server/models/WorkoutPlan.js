// server/models/WorkoutPlan.js
import mongoose from "mongoose";

const WorkoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    workouts: [
      {
        category: { type: String, required: true },
        workoutName: { type: String, required: true },
        sets: { type: Number },
        reps: { type: Number },
        weight: { type: Number },
        duration: { type: Number },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkoutPlan", WorkoutPlanSchema);
import express from "express";
import {
  UserLogin,
  UserRegister,
  addWorkout,
  getUserDashboard,
  getWorkoutsByDate,
  getContact,
  createGoal,
  getUserGoals,
  createWorkoutPlan,
  getWorkoutPlans,
  applyWorkoutPlan,
  addMeal,
  getMealsByDate,
  getGoalRecommendations,
  getMonthlyWorkouts,
} from "../controllers/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", UserRegister);
router.post("/signin", UserLogin);
router.post("/contact", getContact);

router.get("/dashboard", verifyToken, getUserDashboard);
router.get("/workout", verifyToken, getWorkoutsByDate);
router.get("/monthly-workouts", verifyToken, getMonthlyWorkouts);
router.post("/workout", verifyToken, addWorkout);

router.post("/goals", verifyToken, createGoal); 
router.get("/goals", verifyToken, getUserGoals);

// server/routes/User.js
router.post("/workout-plan", verifyToken, createWorkoutPlan);
router.get("/workout-plan", verifyToken, getWorkoutPlans);
router.post("/workout-plan/apply", verifyToken, applyWorkoutPlan);

router.post("/meal", verifyToken, addMeal);
router.get("/meal", verifyToken, getMealsByDate);

// server/routes/User.js
router.get("/recommendations", verifyToken, getGoalRecommendations);

export default router;

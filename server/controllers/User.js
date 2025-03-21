// server/controllers/User.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../error.js";
import User from "../models/User.js";
import Goal from "../models/Goal.js";
import Meal from "../models/Meal.js";
import Workout from "../models/Workout.js";
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import WorkoutPlan from "../models/WorkoutPlan.js";


dotenv.config();

export const getGoalRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(createError(401, "User not authenticated"));

    const goals = await Goal.find({ user: userId });
    if (!goals.length) return res.status(200).json({ recommendations: [] });

    // Fetch user data for analysis
    const workouts = await Workout.find({ user: userId }).sort({ date: -1 }).limit(50); // Last 50 workouts
    const meals = await Meal.find({ user: userId }).sort({ date: -1 }).limit(50); // Last 50 meals

    // Analyze workout patterns
    const categoryCounts = workouts.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Cardio";
    const avgCaloriesPerWorkout = workouts.length
      ? workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0) / workouts.length
      : 200; // Default assumption

    // Analyze nutrition trends
    const avgDailyCaloriesConsumed = meals.length
      ? meals.reduce((sum, m) => sum + m.calories, 0) / (meals.length / 7) // Rough weekly avg
      : 2000; // Default assumption

    const recommendations = await Promise.all(
      goals.map(async (goal) => {
        const now = new Date();
        if (new Date(goal.endDate) < now) return null; // Skip expired goals

        // Progress calculation
        const goalWorkouts = await Workout.find({
          user: userId,
          date: { $gte: new Date(goal.startDate), $lte: new Date(goal.endDate) },
        });
        const caloriesBurned = goalWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

        const goalMeals = await Meal.find({
          user: userId,
          date: { $gte: new Date(goal.startDate), $lte: new Date(goal.endDate) },
        });
        const caloriesConsumed = goalMeals.reduce((sum, m) => sum + m.calories, 0);

        const remainingCalories = goal.targetCalories - caloriesBurned;
        const daysLeft = Math.max(1, Math.ceil((new Date(goal.endDate) - now) / (1000 * 60 * 60 * 24)));
        const dailyBurnNeeded = remainingCalories / daysLeft;

        // Personalized recommendations
        const recs = [];
        if (remainingCalories > 0) {
          // Workout suggestion based on top category
          const workoutsNeeded = Math.ceil(remainingCalories / avgCaloriesPerWorkout);
          recs.push(
            `Based on your ${topCategory} preference, add ${workoutsNeeded} ${Math.round(
              remainingCalories / workoutsNeeded / 10
            )}-min ${topCategory.toLowerCase()} sessions this week (~${Math.round(
              avgCaloriesPerWorkout
            )} kcal each).`
          );

          // Nutrition adjustment
          if (caloriesConsumed > caloriesBurned) {
            const excessCalories = caloriesConsumed - caloriesBurned;
            const dailyReduction = Math.min(500, Math.round(excessCalories / daysLeft));
            recs.push(
              `You’re averaging ${Math.round(
                avgDailyCaloriesConsumed
              )} kcal daily; reduce intake by ${dailyReduction} kcal/day (e.g., fewer carbs or snacks).`
            );
          }

          // Pace suggestion
          recs.push(
            `To hit your goal by ${new Date(goal.endDate).toLocaleDateString()}, burn ${Math.round(
              dailyBurnNeeded
            )} kcal daily—try splitting it across ${topCategory} and another activity.`
          );
        } else {
          recs.push(
            `Amazing! You’ve exceeded your ${goal.name} goal—consider setting a new challenge!`
          );
        }

        return {
          goalName: goal.name,
          progress: caloriesBurned,
          target: goal.targetCalories,
          recommendations: recs,
        };
      })
    );

    return res.status(200).json({ recommendations: recommendations.filter((r) => r !== null) });
  } catch (err) {
    console.error("Error in getGoalRecommendations:", err);
    next(err);
  }
};

// Add a meal
export const addMeal = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { name, calories } = req.body;

    if (!name || !calories) {
      return next(createError(400, "Name and calories are required"));
    }

    const meal = new Meal({ user: userId, name, calories });
    const savedMeal = await meal.save();
    return res.status(201).json({ message: "Meal added", meal: savedMeal });
  } catch (err) {
    next(err);
  }
};

// Get meals for a specific date
export const getMealsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    let date = req.query.date ? new Date(req.query.date) : new Date();
    
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const meals = await Meal.find({
      user: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    return res.status(200).json({ meals, totalCalories });
  } catch (err) {
    next(err);
  }
};

// Create a new workout plan
export const createWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { name, workouts } = req.body;

    if (!name || !workouts || !Array.isArray(workouts)) {
      return next(createError(400, "Name and workouts array are required"));
    }

    const plan = new WorkoutPlan({ user: userId, name, workouts });
    const savedPlan = await plan.save();
    return res.status(201).json({ message: "Workout plan created", plan: savedPlan });
  } catch (err) {
    next(err);
  }
};

// Get all workout plans for a user
export const getWorkoutPlans = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const plans = await WorkoutPlan.find({ user: userId });
    return res.status(200).json({ plans });
  } catch (err) {
    next(err);
  }
};

// Apply a workout plan to a specific date
export const applyWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { planId, date } = req.body;
    const plan = await WorkoutPlan.findById(planId);

    if (!plan || plan.user.toString() !== userId) {
      return next(createError(404, "Workout plan not found"));
    }

    const workouts = plan.workouts.map((w) => ({
      ...w,
      user: userId,
      date: new Date(date || Date.now()),
      caloriesBurned: calculateCaloriesBurnt(w), // Reuse existing function
    }));

    await Workout.insertMany(workouts);
    return res.status(201).json({ message: "Workout plan applied", workouts });
  } catch (err) {
    next(err);
  }
};

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return next(createError(409, "Email is already in use."));
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    const createdUser = await user.save();
    const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
      expiresIn: "1d",
    });
    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    // Check if user exists
    if (!user) {
      return next(createError(404, "User not found"));
    }
    console.log(user);
    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(403, "Incorrect password"));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "9999 years",
    });

    return res.status(200).json({ token, user });
  } catch (error) {
    return next(error);
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );

    //calculte total calories burnt
    const totalCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Calculate total no of workouts
    const totalWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    //Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalCaloriesBurnt.length > 0
        ? totalCaloriesBurnt[0].totalCaloriesBurnt / totalWorkouts
        : 0;

    // Fetch category of workouts
    const categoryCalories = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: "$category",
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    //Format category data for pie chart

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
      );
      weeks.push(`${date.getDate()}th`);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    return res.status(200).json({
      totalCaloriesBurnt:
        totalCaloriesBurnt.length > 0
          ? totalCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: caloriesBurnt,
      },
      pieChartData: pieChartData,
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    let date = req.query.date ? new Date(req.query.date) : new Date();
    if (!user) {
      return next(createError(404, "User not found"));
    }
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const todaysWorkouts = await Workout.find({
      userId: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutString } = req.body;
    if (!workoutString) {
      return next(createError(400, "Workout string is missing"));
    }
    // Split workoutString into lines
    const eachworkout = workoutString.split(";").map((line) => line.trim());
    // Check if any workouts start with "#" to indicate categories
    const categories = eachworkout.filter((line) => line.startsWith("#"));
    if (categories.length === 0) {
      return next(createError(400, "No categories found in workout string"));
    }

    const parsedWorkouts = [];
    let currentCategory = "";
    let count = 0;

    // Loop through each line to parse workout details
    await eachworkout.forEach((line) => {
      count++;
      if (line.startsWith("#")) {
        const parts = line?.split("\n").map((part) => part.trim());
        console.log(parts);
        if (parts.length < 5) {
          return next(
            createError(400, `Workout string is missing for ${count}th workout`)
          );
        }

        // Update current category
        currentCategory = parts[0].substring(1).trim();
        // Extract workout details
        const workoutDetails = parseWorkoutLine(parts);
        if (workoutDetails == null) {
          return next(createError(400, "Please enter in proper format "));
        }

        if (workoutDetails) {
          // Add category to workout details
          workoutDetails.category = currentCategory;
          parsedWorkouts.push(workoutDetails);
        }
      } else {
        return next(
          createError(400, `Workout string is missing for ${count}th workout`)
        );
      }
    });

    // Calculate calories burnt for each workout
    await parsedWorkouts.forEach(async (workout) => {
      workout.caloriesBurned = parseFloat(calculateCaloriesBurnt(workout));
      await Workout.create({ ...workout, user: userId });
    });

    return res.status(201).json({
      message: "Workouts added successfully",
      workouts: parsedWorkouts,
    });
  } catch (err) {
    next(err);
  }
};

// Function to parse workout details from a line
const parseWorkoutLine = (parts) => {
  const details = {};
  console.log(parts);
  if (parts.length >= 5) {
    details.workoutName = parts[1].substring(1).trim();
    details.sets = parseInt(parts[2].split("sets")[0].substring(1).trim());
    details.reps = parseInt(
      parts[2].split("sets")[1].split("reps")[0].substring(1).trim()
    );
    details.weight = parseFloat(parts[3].split("kg")[0].substring(1).trim());
    details.duration = parseFloat(parts[4].split("min")[0].substring(1).trim());
    console.log(details);
    return details;
  }
  return null;
};

// Function to calculate calories burnt for a workout
const calculateCaloriesBurnt = (workoutDetails) => {
  const durationInMinutes = parseInt(workoutDetails.duration);
  const weightInKg = parseInt(workoutDetails.weight);
  const caloriesBurntPerMinute = 5; // Sample value, actual calculation may vary
  return durationInMinutes * caloriesBurntPerMinute * weightInKg;
};

export const getContact= async (req, res) => {
  const { fullName, email, sub,number, message } = req.body;

  if (!fullName || !email || !sub || !number || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Send email using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'maniinnovator26@gmail.com',
        pass: 'zftagkvlpejhfsfj',
      },
    });

    await transporter.sendMail({
      to: 'mani.yellowmatics@gmail.com',
      subject: `New message from ${fullName} Regarding ${sub}`,
      text: `Message: ${message} \n Phone: ${number}`,
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send the message' });
  }
};


// Create a new goal
export const createGoal = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { name, targetCalories, startDate, endDate } = req.body;

    if (!name || !targetCalories || !startDate || !endDate) {
      return next(createError(400, "All fields are required"));
    }

    const goal = new Goal({
      user: userId,
      name,
      targetCalories,
      startDate,
      endDate,
    });

    const savedGoal = await goal.save();
    return res.status(201).json({ message: "Goal created successfully", goal: savedGoal });
  } catch (err) {
    next(err);
  }
};

// Get all goals for a user with progress
export const getUserGoals = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    console.log("User ID:", userId);

    const goals = await Goal.find({ user: userId });
    console.log("Goals found:", goals);

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const totalCaloriesBurned = await Workout.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
              date: { $gte: new Date(goal.startDate), $lte: new Date(goal.endDate) },
            },
          },
          {
            $group: {
              _id: null,
              totalCaloriesBurned: { $sum: "$caloriesBurned" },
            },
          },
        ]);

        const caloriesBurned = totalCaloriesBurned.length > 0 ? totalCaloriesBurned[0].totalCaloriesBurned : 0;
        console.log(`Goal: ${goal.name}, Calories Burned: ${caloriesBurned}`);
        const progress = (caloriesBurned / goal.targetCalories) * 100;

        return {
          ...goal._doc,
          totalCaloriesBurned: caloriesBurned,
          progress: progress > 100 ? 100 : progress,
        };
      })
    );

    return res.status(200).json({ goals: goalsWithProgress });
  } catch (err) {
    console.error("Error in getUserGoals:", err);
    next(err);
  }
};


export const getMonthlyWorkouts = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return next(createError(401, "User not authenticated"));

    const { year, month } = req.query.params;
    
    console.log("User ID:", userId);
    console.log("Query Params:", { year, month });

    let matchStage = { user: userId };
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      matchStage.date = { $gte: startDate, $lte: endDate };
      console.log("Date Range for Detailed View:", { startDate, endDate });

      const workouts = await Workout.find(matchStage).sort({ date: -1 });
      console.log("Found Workouts:", workouts);

      const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
      const categoryBreakdown = workouts.reduce((acc, w) => {
        acc[w.category] = (acc[w.category] || 0) + 1;
        return acc;
      }, {});

      const response = {
        year: parseInt(year),
        month: parseInt(month),
        totalWorkouts: workouts.length,
        totalCaloriesBurned,
        categoryBreakdown,
        workouts,
      };
      console.log("Detailed Response:", response);
      return res.status(200).json(response);
    } else {
      const monthlyData = await Workout.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            totalWorkouts: { $sum: 1 },
            totalCaloriesBurned: { $sum: "$caloriesBurned" },
            categories: { $push: "$category" },
          },
        },
        {
          $project: {
            year: "$_id.year",
            month: "$_id.month",
            totalWorkouts: 1,
            totalCaloriesBurned: 1,
            categoryBreakdown: {
              $arrayToObject: {
                $map: {
                  input: { $setUnion: "$categories" },
                  as: "cat",
                  in: ["$$cat", { $size: { $filter: { input: "$categories", cond: { $eq: ["$$this", "$$cat"] } } } }],
                },
              },
            },
          },
        },
        { $sort: { year: -1, month: -1 } },
      ]);
      console.log("Aggregated Monthly Data:", monthlyData);
      return res.status(200).json({ monthlyWorkouts: monthlyData });
    }
  } catch (err) {
    console.error("Error in getMonthlyWorkouts:", err);
    next(err);
  }
};
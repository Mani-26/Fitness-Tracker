import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/",
});

export const UserSignUp = async (data) => API.post("/user/signup", data);
export const UserSignIn = async (data) => API.post("/user/signin", data);
export const UserContact = async (data) => API.post("/user/contact", data);

export const getDashboardDetails = async (token) =>
  API.get("/user/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getWorkouts = async (token, date) =>
  await API.get(`/user/workout${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addWorkout = async (token, data) =>
  await API.post(`/user/workout`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const contact = async (token, data) =>
  await API.post(`/user/contct`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createGoal = async (token, data) =>
  await API.post("/user/goals", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getGoals = async (token) =>
  await API.get("/user/goals", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createWorkoutPlan = async (token, data) =>
  await API.post("/user/workout-plan", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getWorkoutPlans = async (token) =>
  await API.get("/user/workout-plan", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const applyWorkoutPlan = async (token, data) =>
  await API.post("/user/workout-plan/apply", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addMeal = async (token, data) =>
  await API.post("/user/meal", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getMeals = async (token, date) =>
  await API.get(`/user/meal${date ? `?date=${date}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getRecommendations = async (token) =>
  await API.get("/user/recommendations", {
    headers: { Authorization: `Bearer ${token}` },
  });

  export const getMonthlyWorkouts = async (token, params = {}) =>
    await API.get("/user/monthly-workouts", {
      headers: { Authorization: `Bearer ${token}` },
      params, // Pass year and month if provided
    });

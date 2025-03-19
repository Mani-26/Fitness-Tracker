import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";  // <-- Import axios

const initialState = {
  currentUser: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      localStorage.setItem("fittrack-app-token", action.payload.token);
    },
    logout: (state) => {
      state.currentUser = null;
      localStorage.removeItem("fitttrack-app-token");
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;


export const fetchGoals = createAsyncThunk("user/fetchGoals", async (_, { getState }) => {
  const token = localStorage.getItem("fittrack-app-token");
  const response = await axios.get("http://localhost:8080/api/goal", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});

export default userSlice.reducer;
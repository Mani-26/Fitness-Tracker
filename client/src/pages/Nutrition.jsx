// client/src/pages/Nutrition.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { addMeal, getMeals } from "../api";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const Container = styled.div`
  flex: 1;
  padding: 22px 16px;
  display: flex;
  gap: 22px;
`;
const MealCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
`;

const Nutrition = () => {
  const [meals, setMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({ name: "", calories: "" });
  const [date, setDate] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchMeals = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    const res = await getMeals(token, date);
    setMeals(res.data.meals);
    setTotalCalories(res.data.totalCalories);
    setLoading(false);
  };

  const handleAddMeal = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    await addMeal(token, newMeal);
    fetchMeals();
    setNewMeal({ name: "", calories: "" });
    setLoading(false);
  };

  useEffect(() => {
    fetchMeals();
  }, [date]);

  return (
    <Container>
      <div>
        <h2>Select Date</h2>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar onChange={(e) => setDate(`${e.$y}-${e.$M + 1}-${e.$D}`)} />
        </LocalizationProvider>
      </div>
      <div>
        <h2>Nutrition</h2>
        <TextInput
          label="Meal Name"
          value={newMeal.name}
          handelChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
        />
        <TextInput
          label="Calories"
          value={newMeal.calories}
          handelChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
        />
        <Button text="Add Meal" onClick={handleAddMeal} isLoading={loading} />
        <h3>Total Calories: {totalCalories} kcal</h3>
        {meals.map((meal) => (
          <MealCard key={meal._id}>
            <p>{meal.name}: {meal.calories} kcal</p>
          </MealCard>
        ))}
      </div>
    </Container>
  );
};

export default Nutrition;
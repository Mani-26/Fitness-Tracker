import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { createGoal, getGoals } from "../api";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs"; // Import dayjs for date handling

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
`;
const Wrapper = styled.div`
  flex: 1;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 0px 16px;
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;
const Title = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const GoalCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;
const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background: ${({ theme }) => theme.bgLight};
  border-radius: 10px;
  overflow: hidden;
`;
const Progress = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.primary};
  width: ${({ progress }) => progress}%;
`;

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetCalories: "",
    startDate: null, // Use null for DatePicker initial value
    endDate: null,   // Use null for DatePicker initial value
  });

  const fetchGoals = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    await getGoals(token)
      .then((res) => {
        setGoals(res.data.goals);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching goals:", err);
        setLoading(false);
      });
  };

  const handleCreateGoal = async () => {
    setButtonLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    const formattedGoal = {
      ...newGoal,
      startDate: newGoal.startDate ? newGoal.startDate.format("YYYY-MM-DD") : "",
      endDate: newGoal.endDate ? newGoal.endDate.format("YYYY-MM-DD") : "",
    };
    await createGoal(token, formattedGoal)
      .then(() => {
        fetchGoals();
        setNewGoal({ name: "", targetCalories: "", startDate: null, endDate: null });
        setButtonLoading(false);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error creating goal");
        setButtonLoading(false);
      });
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <Container>
      <Wrapper>
        <Title>Fitness Goals</Title>
        <Section>
          <h3>Create New Goal</h3>
          <TextInput
            label="Goal Name"
            placeholder="e.g., Lose 5kg"
            value={newGoal.name}
            handelChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
          />
          <TextInput
            label="Target Calories"
            placeholder="e.g., 5000"
            value={newGoal.targetCalories}
            handelChange={(e) => setNewGoal({ ...newGoal, targetCalories: e.target.value })}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={newGoal.startDate}
              onChange={(newValue) => setNewGoal({ ...newGoal, startDate: newValue })}
              slotProps={{ textField: { variant: "outlined" } }}
            />
            <DatePicker
              label="End Date"
              value={newGoal.endDate}
              onChange={(newValue) => setNewGoal({ ...newGoal, endDate: newValue })}
              slotProps={{ textField: { variant: "outlined" } }}
            />
          </LocalizationProvider>
          <Button
            text="Create Goal"
            onClick={handleCreateGoal}
            isLoading={buttonLoading}
            isDisabled={buttonLoading}
          />
        </Section>
        <Section>
          <h3>Your Goals</h3>
          {loading ? (
            <CircularProgress />
          ) : (
            goals.map((goal) => (
              <GoalCard key={goal._id}>
                <h4>{goal.name}</h4>
                <p>Target: {goal.targetCalories} kcal</p>
                <p>Start: {new Date(goal.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(goal.endDate).toLocaleDateString()}</p>
                <p>Calories Burned: {goal.totalCaloriesBurned} kcal</p>
                <ProgressBar>
                  <Progress progress={goal.progress || 0} />
                </ProgressBar>
                <p>Progress: {(goal.progress || 0).toFixed(2)}%</p>
              </GoalCard>
            ))
          )}
        </Section>
      </Wrapper>
    </Container>
  );
};

export default Goals;
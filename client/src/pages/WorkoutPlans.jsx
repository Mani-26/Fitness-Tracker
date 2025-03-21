import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { createWorkoutPlan, getWorkoutPlans, applyWorkoutPlan } from "../api";

const Container = styled.div`
  flex: 1;
  padding: 22px 16px;
  overflow-y: scroll;
`;
const PlanCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  margin-bottom: 16px;
`;

const WorkoutPlans = () => {
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: "", workoutString: "" });
  const [loading, setLoading] = useState(false);

  const parseWorkoutString = (workoutString) => {
    const lines = workoutString.split("\n").map((line) => line.trim());
    const workouts = [];
    let currentCategory = "";
  
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#")) {
        currentCategory = lines[i].substring(1).trim();
      } else if (lines[i].startsWith("-")) {
        const parts = lines.slice(i, i + 5); // Take the next 5 lines starting from the workout name
        if (parts.length === 5) {
          const workout = {
            category: currentCategory,
            workoutName: parts[0].substring(1).trim(), // -Front Squat → Front Squat
            sets: parseInt(parts[1].split("sets")[0].trim(), 10), // "5 sets" → 5
            reps: parseInt(parts[2].split("reps")[0].trim(), 10), // "15 reps" → 15
            weight: parseFloat(parts[3].split("kg")[0].trim()), // "45 kg" → 45
            duration: parseFloat(parts[4].split("min")[0].trim()), // "30 min" → 30
          };
          workouts.push(workout);
          i += 4; // Skip the processed lines
        }
      }
    }
    return workouts;
  };

  const fetchPlans = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const res = await getWorkoutPlans(token);
      setPlans(res.data.plans || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workout plans:", err);
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const workouts = parseWorkoutString(newPlan.workoutString);
      if (!workouts.length) {
        alert("Please enter at least one workout in the correct format.");
        setLoading(false);
        return;
      }
      await createWorkoutPlan(token, { name: newPlan.name, workouts });
      await fetchPlans();
      setNewPlan({ name: "", workoutString: "" });
    } catch (err) {
      alert("Failed to create workout plan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPlan = async (planId) => {
    const token = localStorage.getItem("fittrack-app-token");
    try {
      await applyWorkoutPlan(token, { planId });
      alert("Plan applied to today!");
    } catch (err) {
      alert("Failed to apply plan: " + err.message);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <Container>
      <h2>Workout Plans</h2>
      <TextInput
        label="Plan Name"
        value={newPlan.name}
        handelChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
      />
      <TextInput
        label="Workouts"
        textArea
        rows={10}
        placeholder="#Category\n-Name\n-Sets\n-Reps\n-Weight\n-Duration"
        value={newPlan.workoutString}
        handelChange={(e) => setNewPlan({ ...newPlan, workoutString: e.target.value })}
      />
      <Button text="Create Plan" onClick={handleCreatePlan} isLoading={loading} />
      <div>
        {plans.map((plan) => (
          <PlanCard key={plan._id}>
            <h3>{plan.name}</h3>
            <Button text="Apply Plan" small onClick={() => handleApplyPlan(plan._id)} />
          </PlanCard>
        ))}
      </div>
    </Container>
  );
};

export default WorkoutPlans;
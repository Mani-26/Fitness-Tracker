import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { counts } from "../utils/data";
import CountsCard from "../components/cards/CountsCard";
import CountsCard1 from "../components/cards/CountsCard1";
import WeeklyStatCard from "../components/cards/WeeklyStatCard";
import CategoryChart from "../components/cards/CategoryChart";
import AddWorkout from "../components/AddWorkout";
import WorkoutCard from "../components/cards/WorkoutCard";
import { addWorkout, getDashboardDetails, getWorkouts, getMeals } from "../api"; // Added getMeals

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
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Title = styled.div`
  padding: 0px 16px;
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const FlexWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
  gap: 22px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 100px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // Initialize as null for clarity
  const [buttonLoading, setButtonLoading] = useState(false);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [workout, setWorkout] = useState(`#Legs
-Back Squat
-5 setsX15 reps
-30 kg
-10 min`);
  const [nutritionData, setNutritionData] = useState({ totalCalories: 0 });

  const dashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const res = await getDashboardDetails(token);
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  const getTodaysWorkout = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const res = await getWorkouts(token, "");
      setTodaysWorkouts(res?.data?.todaysWorkouts || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setLoading(false);
    }
  };

  const fetchNutrition = async () => {
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const res = await getMeals(token, "");
      console.log("API Response for Meals:", res.data); // Debug log
      setNutritionData({ totalCalories: res.data.totalCalories || 0 });
    } catch (err) {
      console.error("Error fetching nutrition data:", err);
    }
  };

  const addNewWorkout = async () => {
    setButtonLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      await addWorkout(token, { workoutString: workout });
      await Promise.all([dashboardData(), getTodaysWorkout()]); // Refresh data
    } catch (err) {
      alert("Failed to add workout: " + err.message);
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([dashboardData(), getTodaysWorkout(), fetchNutrition()]).catch(
      (err) => console.error("Initial data fetch failed:", err)
    );
  }, []);
  
  console.log(nutritionData.totalCalories);

  return (
    <Container>
      <Wrapper>
        <Title>Dashboard</Title>
        {/* <FlexWrap></FlexWrap> */}

        <FlexWrap>
          <CountsCard1
            item={{
              // ...counts[4],
              name: "Calories Consumed",
              desc: "Total calories consumed today",
            }}
            data={nutritionData.totalCalories}
            />
          {counts.map((item) => (
            <CountsCard key={item.name} item={item} data={data} />
          ))}
          <WeeklyStatCard data={data} />
          <CategoryChart data={data} />
          <AddWorkout
            workout={workout}
            setWorkout={setWorkout}
            addNewWorkout={addNewWorkout}
            buttonLoading={buttonLoading}
          />
        </FlexWrap>

        <Section>
          <Title>Todays Workouts</Title>
          <CardWrapper>
            {todaysWorkouts.map((workout) => (
              <WorkoutCard key={workout._id} workout={workout} />
            ))}
          </CardWrapper>
        </Section>
      </Wrapper>
    </Container>
  );
};

export default Dashboard;

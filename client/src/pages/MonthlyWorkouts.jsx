// client/src/pages/MonthlyWorkouts.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getMonthlyWorkouts } from "../api";
import { CircularProgress } from "@mui/material";
import WorkoutCard from "../components/cards/WorkoutCard";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { BarChart } from "@mui/x-charts/BarChart"; // Import BarChart
import dayjs from "dayjs";

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
const Title = styled.div`
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const MonthCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  box-shadow: 1px 6px 20px 0px ${({ theme }) => theme.primary + 15};
`;
const CategoryList = styled.ul`
  padding-left: 20px;
  list-style-type: disc;
  color: ${({ theme }) => theme.text_secondary};
  font-size: 14px;
`;
const WorkoutList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
`;
const ChartContainer = styled.div`
  margin-top: 20px;
  width: 100%;
  height: 300px;
`;

const MonthlyWorkouts = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthDetails, setMonthDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMonthlyWorkouts = async () => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const res = await getMonthlyWorkouts(token);
      console.log("Monthly Workouts Response:", res.data);
      setMonthlyData(res.data.monthlyWorkouts || []);
    } catch (err) {
      console.error("Error fetching monthly workouts:", err.response?.data || err.message);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthDetails = async (year, month) => {
    setLoading(true);
    const token = localStorage.getItem("fittrack-app-token");
    try {
      const res = await getMonthlyWorkouts(token, { params: { year, month } });
      console.log("Month Details Response:", res.data);
      setMonthDetails(res.data);
    } catch (err) {
      console.error("Error fetching month details:", err.response?.data || err.message);
      setMonthDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyWorkouts();
  }, []);

  const handleMonthSelect = (date) => {
    if (date) {
      const year = date.year();
      const month = date.month() + 1;
      console.log("Selected Year:", year);
      console.log("Selected Month:", month);
      setSelectedMonth(date);
      fetchMonthDetails(year, month);
    } else {
      setSelectedMonth(null);
      setMonthDetails(null);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Prepare data for summary chart (calories burned per month)
  const summaryChartData = {
    xAxis: monthlyData.map((month) => `${monthNames[month.month - 1]} ${month.year}`),
    series: [
      {
        data: monthlyData.map((month) => month.totalCaloriesBurned || 0),
        label: "Calories Burned",
      },
    ],
  };

  // Prepare data for detailed chart (calories by category for selected month)
  const detailedChartData = monthDetails
    ? {
        xAxis: Object.keys(monthDetails.categoryBreakdown || {}),
        series: [
          {
            data: Object.values(monthDetails.categoryBreakdown || {}).map((count) =>
              monthDetails.workouts
                .filter((w) => w.category === Object.keys(monthDetails.categoryBreakdown)[Object.values(monthDetails.categoryBreakdown).indexOf(count)])
                .reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
            ),
            label: "Calories Burned",
          },
        ],
      }
    : null;

  return (
    <Container>
      <Wrapper>
        <Title>Monthly Workout Summary</Title>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year", "month"]}
            label="Select Month"
            value={selectedMonth}
            onChange={handleMonthSelect}
            slotProps={{ textField: { variant: "outlined" } }}
          />
        </LocalizationProvider>
        {loading ? (
          <CircularProgress />
        ) : selectedMonth && monthDetails ? (
          <MonthCard>
            <h3>{`${monthNames[selectedMonth.month()]} ${selectedMonth.year()}`}</h3>
            <p>Total Workouts: {monthDetails.totalWorkouts || 0}</p>
            <p>Total Calories Burned: {monthDetails.totalCaloriesBurned || 0} kcal</p>
            <h4>Category Breakdown:</h4>
            <CategoryList>
              {Object.entries(monthDetails.categoryBreakdown || {}).map(([category, count]) => (
                <li key={category}>{`${category}: ${count} workout${count > 1 ? "s" : ""}`}</li>
              ))}
            </CategoryList>
            {detailedChartData && detailedChartData.xAxis.length > 0 && (
              <ChartContainer>
                <BarChart
                  xAxis={[{ scaleType: "band", data: detailedChartData.xAxis }]}
                  series={detailedChartData.series}
                  height={300}
                  title="Calories Burned by Category"
                />
              </ChartContainer>
            )}
            <h4>Workouts:</h4>
            <WorkoutList>
              {(monthDetails.workouts || []).map((workout) => (
                <WorkoutCard key={workout._id} workout={workout} />
              ))}
            </WorkoutList>
          </MonthCard>
        ) : (
          <>
            {(monthlyData || []).map((month) => (
              <MonthCard key={`${month.year}-${month.month}`}>
                <h3>{`${monthNames[month.month - 1]} ${month.year}`}</h3>
                <p>Total Workouts: {month.totalWorkouts}</p>
                <p>Total Calories Burned: {month.totalCaloriesBurned} kcal</p>
                <h4>Category Breakdown:</h4>
                <CategoryList>
                  {Object.entries(month.categoryBreakdown || {}).map(([category, count]) => (
                    <li key={category}>{`${category}: ${count} workout${count > 1 ? "s" : ""}`}</li>
                  ))}
                </CategoryList>
              </MonthCard>
            ))}
            {monthlyData.length > 0 && (
              <ChartContainer>
                <BarChart
                  xAxis={[{ scaleType: "band", data: summaryChartData.xAxis }]}
                  series={summaryChartData.series}
                  height={300}
                  title="Calories Burned by Month"
                />
              </ChartContainer>
            )}
          </>
        )}
        {!loading && monthlyData.length === 0 && !selectedMonth && (
          <p>No monthly workout data available.</p>
        )}
      </Wrapper>
    </Container>
  );
};

export default MonthlyWorkouts;
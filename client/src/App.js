import { ThemeProvider, styled } from "styled-components";
import { lightTheme } from "./utils/Themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Authentication from "./pages/Authentication";
// import { useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Goals from "./pages/Goals";
import WorkoutPlans from "./pages/WorkoutPlans";
import Nutrition from "./pages/Nutrition";
import MonthlyWorkouts from "./pages/MonthlyWorkouts";

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  overflow-x: hidden;
  overflow-y: hidden;
  transition: all 0.2s ease;
`;

function App() {
  const { currentUser } = useSelector((state) => state.user);
  return (
    <ThemeProvider theme={lightTheme}>
      <BrowserRouter>
        {currentUser ? (
          <Container>
            <Navbar currentUser={currentUser} />
            <Routes>
              <Route path="/" exact element={<Home />} />
              <Route path="/dashboard" exact element={<Dashboard />} />
              <Route path="/contact" exact element={<Contact />} />
              <Route path="/workouts" exact element={<Workouts />} />
              <Route path="/goals" exact element={<Goals />} />
              <Route path="/workout-plans" exact element={<WorkoutPlans />} />
              <Route path="/nutrition" exact element={<Nutrition />} />
              <Route path="/monthly-workouts" exact element={<MonthlyWorkouts />} />
            </Routes>
            {/* <Footer/> */}

          </Container>
        ) : (
          <Container>
            <Authentication />
          </Container>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

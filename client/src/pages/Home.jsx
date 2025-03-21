import React from 'react';
import '../styles.css';

const HomePage = () => {
  const isLoggedIn = Boolean(localStorage.getItem("fittrack-app-token"));

  return (
    <div className="page-wrapper">
      <div className="hero-section">
        <div className="hero-text">
          <h2>Welcome to Your Fitness Journey</h2>
          <p>Your personal assistant for achieving your fitness goals, tracking workouts, and living a healthy life!</p>
          {isLoggedIn ? (
            <a href="/dashboard" className="cta-btn">Get Started</a>
          ) : (
            <a href="/login" className="cta-btn">Get Started</a>
          )}
        </div>
      </div>

      <section className="features">
        <div className="feature-card">
          <i className="fa fa-calendar-check feature-icon"></i>
          <h3>Track Your Progress</h3>
          <p>Stay on top of your fitness journey by logging workouts, meals, and more.</p>
        </div>
        <div className="feature-card">
          <i className="fa fa-person-running feature-icon"></i>
          <h3>Personalized Plans</h3>
          <p>Get customized fitness plans tailored to your goals, body type, and lifestyle.</p>
        </div>
        <div className="feature-card">
          <i className="fa fa-chart-line feature-icon"></i>
          <h3>Real-time Stats</h3>
          <p>Track your calories burned, steps taken, and other important metrics in real-time.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
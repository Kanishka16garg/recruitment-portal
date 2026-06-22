import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Find Your Dream Job Today</h1>
          <h4>
            Connecting Talent with Opportunities Across the Nation for Every Skill Level
          </h4>
          <p>
            Explore a vast array of job listings in diverse industries. Whether
            you're a seasoned professional or just starting out, find the perfect
            role to advance your career. Our platform makes job searching easy and
            efficient, bringing you closer to your next big opportunity.
          </p>
          <div className="hero-buttons">
            <Link to="/jobs" className="btn primary-btn">Browse Jobs</Link>
            <Link to="/register" className="btn secondary-btn">Get Started</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80" 
              alt="Job Search" 
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23dfdf07" width="600" height="400"/%3E%3Ctext fill="%23111" font-family="Arial" font-size="24" x="200" y="200"%3EJob Portal%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

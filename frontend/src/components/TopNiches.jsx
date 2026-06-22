import React from "react";
import { FaCode, FaLaptopCode, FaChartLine, FaCloud, FaCogs, FaMobileAlt } from "react-icons/fa";

const TopNiches = () => {
  const services = [
    {
      id: 1,
      service: "Software Development",
      icon: <FaCode />,
      description:
        "Innovative software development services to build, maintain, and upgrade applications, ensuring they meet the highest quality standards.",
      color: "#4A90E2"
    },
    {
      id: 2,
      service: "Web Development",
      icon: <FaLaptopCode />,
      description:
        "Comprehensive web development solutions from front-end design to back-end integration, delivering responsive and user-friendly websites.",
      color: "#50C878"
    },
    {
      id: 3,
      service: "Data Science",
      icon: <FaChartLine />,
      description:
        "Advanced data science services to analyze and interpret complex data, providing actionable insights and data-driven solutions.",
      color: "#FF6B6B"
    },
    {
      id: 4,
      service: "Cloud Computing",
      icon: <FaCloud />,
      description:
        "Reliable cloud computing services to manage, store, and process data efficiently, offering scalable and flexible cloud solutions.",
      color: "#9B59B6"
    },
    {
      id: 5,
      service: "DevOps",
      icon: <FaCogs />,
      description:
        "DevOps services to streamline software development and operations, enhancing deployment efficiency and reducing time to market.",
      color: "#F39C12"
    },
    {
      id: 6,
      service: "Mobile App Development",
      icon: <FaMobileAlt />,
      description:
        "Expert mobile app development for iOS and Android platforms, creating intuitive and engaging mobile experiences for your users.",
      color: "#E74C3C"
    },
  ];

  return (
    <section className="services">
      <div className="services-header">
        <h3>Top Niches</h3>
        <p>Explore opportunities in the most in-demand technology fields</p>
      </div>
      <div className="grid">
        {services.map((element) => {
          return (
            <div className="card" key={element.id}>
              <div className="card-icon" style={{ color: element.color }}>
                {element.icon}
              </div>
              <h4>{element.service}</h4>
              <p>{element.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TopNiches;

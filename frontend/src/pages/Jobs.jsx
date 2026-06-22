import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { clearAllJobErrors, fetchJobs } from "../store/slices/jobSlice";
import Spinner from "../components/Spinner";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

const Jobs = () => {
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  const { jobs, loading, error } = useSelector((state) => state.jobs);

  const handleCityChange = (cityValue) => {
    if (cityValue === "All") {
      setSelectedCities([]);
    } else {
      setSelectedCities((prev) => {
        if (prev.includes(cityValue)) {
          return prev.filter((c) => c !== cityValue);
        } else {
          return [...prev, cityValue];
        }
      });
    }
  };

  const handleNicheChange = (nicheValue) => {
    if (nicheValue === "All") {
      setSelectedNiches([]);
    } else {
      setSelectedNiches((prev) => {
        if (prev.includes(nicheValue)) {
          return prev.filter((n) => n !== nicheValue);
        } else {
          return [...prev, nicheValue];
        }
      });
    }
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllJobErrors());
    }
    dispatch(fetchJobs(selectedCities, selectedNiches, searchKeyword));
  }, [dispatch, error, selectedCities, selectedNiches, searchKeyword]);

  const handleSearch = () => {
    dispatch(fetchJobs(selectedCities, selectedNiches, searchKeyword));
  };

  const cities = [
    "All",
    "Bengaluru",
    "Hyderabad",
    "Mumbai",
    "Delhi NCR",
    "Pune",
    "Chennai",
    "Gurugram",
    "Noida",
    "Ahemadabad",
    "Kochi",
    "Kolkata",
    "Jaipur",
    "Indore",
    "Nagpur",
    "Coimbatore",
    "Lucknow",
    "Chandigarh",
    "Surat",
    "Bhopal",
    "Bhubaneswar",
  ];

  const nichesArray = [
    "All",
    "Software Development",
    "Web Development",
    "Cybersecurity",
    "Data Science",
    "Artificial Intelligence",
    "Cloud Computing",
    "DevOps",
    "Mobile App Development",
    "Blockchain",
    "Database Administration",
    "Network Administration",
    "UI/UX Design",
    "Game Development",
    "IoT (Internet of Things)",
    "Big Data",
    "Machine Learning",
    "IT Project Management",
    "IT Support and Helpdesk",
    "Systems Administration",
    "IT Consulting",
  ];

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <section className="jobs">
          <div className="search-tab-wrapper">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button onClick={handleSearch}>Find Job</button>
            <FaSearch />
          </div>
          <div className="wrapper">
            <div className="filter-bar">
              <div className="cities">
                <h2>Filter Job By City</h2>
                {cities.map((city, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={`city-${index}`}
                      value={city}
                      checked={city === "All" ? selectedCities.length === 0 : selectedCities.includes(city)}
                      onChange={() => handleCityChange(city)}
                    />
                    <label htmlFor={`city-${index}`}>{city}</label>
                  </div>
                ))}
              </div>
              <div className="cities">
                <h2>Filter Job By Niche</h2>
                {nichesArray.map((niche, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={`niche-${index}`}
                      value={niche}
                      checked={niche === "All" ? selectedNiches.length === 0 : selectedNiches.includes(niche)}
                      onChange={() => handleNicheChange(niche)}
                    />
                    <label htmlFor={`niche-${index}`}>{niche}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="container">
              <div className="mobile-filter">
                <select 
                  multiple
                  value={selectedCities}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    if (values.includes("All")) {
                      setSelectedCities([]);
                    } else {
                      setSelectedCities(values);
                    }
                  }}
                  style={{ minHeight: "100px" }}
                >
                  {cities.map((city, index) => (
                    <option value={city} key={index}>
                      {city}
                    </option>
                  ))}
                </select>
                <select
                  multiple
                  value={selectedNiches}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    if (values.includes("All")) {
                      setSelectedNiches([]);
                    } else {
                      setSelectedNiches(values);
                    }
                  }}
                  style={{ minHeight: "100px" }}
                >
                  {nichesArray.map((niche, index) => (
                    <option value={niche} key={index}>
                      {niche}
                    </option>
                  ))}
                </select>
              </div>
              <div className="jobs_container">
                {jobs && jobs.length > 0 ? (jobs.map((element) => {
                    return (
                      <div className="card" key={element._id}>
                        {element.hiringMultipleCandidates === "Yes" ? (
                          <p className="hiring-multiple">
                            Hiring Multiple Candidates
                          </p>
                        ) : (
                          <p className="hiring">Hiring</p>
                        )}
                        <p className="title">{element.title}</p>
                        <p className="company">{element.companyName}</p>
                        <p className="location">{element.location}</p>
                        <p className="salary">
                          <span>Salary:</span> Rs. {element.salary}
                        </p>
                        <p className="posted">
                          <span>Posted On:</span>{" "}
                          {element.jobPostedOn.substring(0, 10)}
                        </p>
                        <div className="btn-wrapper">
                          <Link
                            className="btn"
                            to={`/post/application/${element._id}`}
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    );
                  })) : (
                  /************************************************************/
                  /* BUG No.2 */
                  <img src="./notfound.png" alt="job-not-found" style={{width: "100%"}}/>)
                  /************************************************************/




                  }
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Jobs;

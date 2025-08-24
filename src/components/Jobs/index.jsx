import React, { useState } from "react";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import "./index.css";
import Job from "./../../Assets/jobs.json";
import Filter from "../Filter";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const experience = [
  { min: 0, max: 1 },
  { min: 2, max: 3 },
  { min: 4, max: 5 },
  { min: 6, max: 10 }, // note: original had overlap 5 — adjust as needed
];

const STORAGE_KEY = "savedJob"; // consistent key

const Jobs = () => {
  // load saved job (single item) or null
  const savedJobFromStorage = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  const JobData = JSON.parse(localStorage.getItem("item") || "[]"); // keep this if you intentionally store "item" elsewhere

  const [filteredJobs, setFilteredJobs] = useState(() => {
    // initialise with local saved + jobs.json (avoid mutation)
    return [...JobData, ...Job];
  });

  // const [searchTerm, setSearchTerm] = useState("");
  // const [active, setActive] = useState(false);

  function handleJobFilter(event) {
    const value = event.target.innerText;
    event.preventDefault();
    setFilteredJobs(Job.filter((job) => job.role === value));
  }

  // saveClick will accept a job object and save to localStorage
  function saveClick(job) {
    if (!job) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
    setActive((prev) => !prev); // toggle active
    // optional: update state to reflect that this job is saved
    // console.log("Saved job:", job);
  }

  const searchEvent = (event) => {
    const data = event.target.value || "";
    setSearchTerm(data);

    // use the fresh `data` (not state which is async)
    if (data !== "" && data.length > 2) {
      const filterData = Job.filter((item) => {
        if (!item) return false;
        // join values safely (skip objects)
        const joined = Object.values(item)
          .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
          .join(" ");
        return joined.toLowerCase().includes(data.toLowerCase());
      });
      setFilteredJobs(filterData);
    } else {
      setFilteredJobs(Job);
    }
  };

  function handleExperienceFilter(checkedState) {
    let filters = [];
    checkedState.forEach((checked, index) => {
      if (checked) {
        const matched = Job.filter((job) => {
          // ensure job.experience is a number
          const exp = Number(job.experience);
          return exp >= experience[index].min && exp <= experience[index].max;
        });
        filters = [...filters, ...matched];
      }
    });
    // remove duplicates by id (optional)
    const unique = Object.values(
      filters.reduce((acc, j) => {
        acc[j.id] = j;
        return acc;
      }, {})
    );
    setFilteredJobs(unique);
  }

  return (
    <>
      <Navbar />
      <div className="jobs-for-you">
        <div className="job-background">
          <div className="title">
            <h2>Our Jobs</h2>
          </div>
        </div>

        <div className="job-section">
          <div className="job-page">
            {filteredJobs && filteredJobs.length > 0 ? (
              filteredJobs.map(({ id, logo, company, position, location, posted, role }) => {
                // safe check for logo string
                const isUrlLogo = typeof logo === "string" && logo.length > 20;
                let logoSrc;
                try {
                  logoSrc = isUrlLogo ? logo : require(`../../Assets/images/${logo}`);
                } catch (err) {
                  // fallback in case require fails
                  logoSrc = "/fallback-logo.png";
                }

                const savedJob = savedJobFromStorage;
                const isSaved = savedJob && savedJob.id === id;

                return (
                  <div className="job-list" key={id}>
                    <div className="job-card">
                      <div className="job-name">
                        <img src={logoSrc} alt="logo" className="job-profile" />
                        <div className="job-detail">
                          <h4>{company}</h4>
                          <h3>{position}</h3>
                          <div className="category">
                            <p>{location}</p>
                            <p>{role}</p>
                          </div>
                        </div>
                      </div>

                      <div className="job-button">
                        <div className="job-posting">
                          <Link to="/apply-jobs">Apply Now</Link>
                        </div>

                        <div className="save-button">
                          <button
                            type="button"
                            onClick={() =>
                              saveClick({ id, logo, company, position, location, posted })
                            }
                            className="save-btn"
                          >
                            {isSaved ? <AiFillHeart /> : <AiOutlineHeart />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No jobs found.</p>
            )}
          </div>

          <Filter
            setFilteredJobs={setFilteredJobs}
            handleJobFilter={handleJobFilter}
            handleExperienceFilter={handleExperienceFilter}
            searchEvent={searchEvent}
          />
        </div>
      </div>
    </>
  );
};

export default Jobs;

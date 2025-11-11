import React, { useState } from "react";
import { FaBuilding, FaMapMarkerAlt, FaMoneyBill } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../JobCard/JobCard.css";
import backendService from "../../Flask_service/flask";
import { useFlash } from "../../context/FlashContext";
import ConfirmModal from "../ConfirmModel/ConfirmModel";

const JobCard = ({ job, userRole, userId, onDeleteJob, index }) => {
  const { setFlashMessage } = useFlash();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const confirmDeleteJob = async () => {
    try {
      const response = await backendService.deleteJob(job.id);
      if (response.success) {
        setFlashMessage("Job deleted successfully!", "success");
        onDeleteJob(job.id);
      } else {
        setFlashMessage(response.message || "Failed to delete job.", "error");
      }
    } catch (error) {
      setFlashMessage("An error occurred while deleting the job.", "error");
    }
    closeModal();
  };

  // 🔹 Dynamic color based on AI match score
  const getMatchColor = (score) => {
    if (score >= 85) return "linear-gradient(135deg, #00c853, #b2ff59)"; // green
    if (score >= 70) return "linear-gradient(135deg, #ffc107, #ffeb3b)"; // yellow
    return "linear-gradient(135deg, #ff5252, #ff1744)"; // red
  };

  return (
    <>
      <div className="job-card">
        {/* 🔹 AI Match Badge (first 5 only) */}
        {job.match_score && index < 5 && (
          <div
            className="ai-match-badge"
            style={{
              background: getMatchColor(job.match_score),
              color: "white",
            }}
          >
            {Math.round(job.match_score)}% Matched
          </div>
        )}

        <h3>{job.title}</h3>
        <p><FaBuilding /> {job.company}</p>
        <p><FaMapMarkerAlt /> {job.location}</p>
        <p><FaMoneyBill /> ₹{job.salary.toFixed(2)} LPA</p>
        <p>
          <strong>Posted On:</strong>{" "}
          {new Date(job.posted_on).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>

        {/* 🔹 Reasoning text (first 3 only) */}
        {job.reason && index < 3 && (
          <p className="ai-reason">
            {job.reason}
          </p>
        )}

        <p className="job-description">
          <strong>Description:</strong> {job.description}
        </p>

        <p>
          <strong>Employer:</strong> {job.employer.username}
        </p>

        <Link
          to={`/job-listings/job-info/${job.id}`}
          className="apply-btn more-info"
        >
          More Info
        </Link>

        {userRole === "employer" && userId === job.posted_by ? (
          <>
            <button
              type="button"
              className="apply-btn delete-job"
              onClick={openModal}
              style={{ marginTop: "5px" }}
            >
              Delete Job
            </button>
          </>
        ) : (
          <Link
            to={`/apply-job/${job.id}?title=${encodeURIComponent(job.title)}`}
            className="apply-btn"
            style={{ marginTop: "5px" }}
          >
            Apply Now
          </Link>
        )}
      </div>

      {/* 🧩 Modal for delete confirmation */}
      {isModalOpen && (
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={confirmDeleteJob}
          message="Are you sure you want to delete this job?"
        />
      )}
    </>
  );
};

export default JobCard;

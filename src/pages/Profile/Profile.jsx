
import React, { useState, useEffect, useRef} from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
  FaUser, FaPhone, FaEnvelope, FaAddressCard, FaVenusMars, 
  FaCalendar, FaBriefcase, FaBuilding, FaFile, FaLinkedin, 
  FaGithub, FaTwitter, FaGlobe, FaGraduationCap, FaCertificate,
  FaStethoscope, FaAward, FaClock, FaEdit, FaSave, FaTimes, FaUsers, FaCamera
} from "react-icons/fa";
import { useFlash } from "../../context/FlashContext";
import { EditableField, ReadOnlyField } from "./utils";
import backendService from "../../Flask_service/flask";
import "./Profile.css";

const Profile = () => {
  const user = useSelector((state) => state.auth.userData);
  const { setFlashMessage } = useFlash();
  const fileInputRef = useRef(null);
  
  const [editingFields, setEditingFields] = useState({});
  const [loading, setLoading] = useState({});
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  //input options
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ]

  const availabilityOptions = [
    { value: "Available", label: "Available" },
    { value: "Busy", label: "Busy" },
    { value: "Part-time", label: "Part-time" },
    { value: "Full-time", label: "Full-time" }
  ]

  const companySizeOptions = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "500+", label: "500+ employees" }
  ]


  const [profileData, setProfileData] = useState({
    // general common fields
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
    age: "",
    address: "",
    profile_pic_url: "",
    linkedin: "",
    github: "",
    twitter: "",
    portfolio_website: "",
    
    // job_seeker specific
    medical_license_number: "",
    specialization: "",
    certifications: "",
    skills: "",
    education: "",
    work_experience: "",
    publications: "",
    availability: "",
    resume_url: "",
    
    // employer specific
    company_name: "",
    company_website: "",
    company_description: "",
    industry: "",
    company_size: "",
    founded_year: "",
    headquarters_location: "",
    company_logo: ""
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        console.log("Current user data from Redux:", user); //log
        console.log("User email:", user.email); 
        
        try {
          
          const response = await backendService.getCurrentUserProfile();
          console.log("Backend profile response:", response); // Debug log
          
          if (response.success && response.user) {
            setProfileData(prev => ({
              ...prev,
              ...response.user
            }));
          } else {
          
            setProfileData(prev => ({
              ...prev,
              username: user.username || "",
              first_name: user.first_name || "",
              last_name: user.last_name || "",
              phone: user.phone || "",
              gender: user.gender || "",
              age: user.age || "",
              address: user.address || "",
              company_name: user.company_name || "",
              email: user.email || ""
            }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          
          setProfileData(prev => ({
            ...prev,
            username: user.username || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone: user.phone || "",
            gender: user.gender || "",
            age: user.age || "",
            address: user.address || "",
            company_name: user.company_name || "",
            email: user.email || ""
          }));
        }
      }
    };

    fetchProfileData();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditField = (fieldName) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleSaveField = async (fieldName) => {
    setLoading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const response = await backendService.updateProfile({ [fieldName]: profileData[fieldName] });
      if (response.success) {
        setFlashMessage(`${fieldName.replace('_', ' ')} updated successfully!`, "success");
        setEditingFields(prev => ({ ...prev, [fieldName]: false }));
      } else {
        setFlashMessage(response.message || "Failed to update field", "error");
      }
    } catch (error) {
      setFlashMessage("Failed to update field. Please try again.", "error");
    } finally {
      setLoading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleCancelEdit = (fieldName) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: false }));
    
    if (user) {
      const originalValue = user[fieldName] || "";
      setProfileData(prev => ({
        ...prev,
        [fieldName]: originalValue
      }));
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;


    if (!file.type.startsWith('image/')) { //image
      setFlashMessage("Please select an image file", "error");
      return;
    }

    
    if (file.size > 5 * 1024 * 1024) { //5mb
      setFlashMessage("Image size should be less than 5MB", "error");
      return;
    }

    setUploadingProfilePic(true);
    try {
      const response = await backendService.uploadProfilePicture(file);
      if (response.success) {
        setProfileData(prev => ({
          ...prev,
          profile_pic_url: response.profile_pic_url
        }));
        setFlashMessage("Profile picture updated successfully!", "success");
      } else {
        setFlashMessage(response.message || "Failed to upload profile picture", "error");
      }
    } catch (error) {
      setFlashMessage("Failed to upload profile picture. Please try again.", "error");
    } finally {
      setUploadingProfilePic(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-fields-container">
          <h1>Please sign in to view your profile</h1>
        </div>
        </div>
    );
  }

  const isJobSeeker = user.role === "job_seeker";
  const isEmployer = user.role === "employer";
  const [isLoading, setIsLoading] = useState(false);


  return (
    <div className="profile-container">
     
      <div className="profile-banner">
        <div className="profile-banner-content">
  
          <div className="profile-picture-container">
            <div className="profile-picture">
              {profileData.profile_pic_url ? (<img src={profileData.profile_pic_url} alt="Profile" />) : (<FaUser className="profile-picture-icon" />)}
            </div>
            <button className="profile-edit-btn" onClick={triggerFileInput} disabled={uploadingProfilePic} title="Change Profile Picture">
              {uploadingProfilePic ? <FaClock /> : <FaCamera />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePictureUpload} style={{ display: 'none' }} />
          </div>


          <div className="profile-info">
            <h1 className="profile-name">
              {profileData.first_name} {profileData.last_name}
            </h1>
            <div className="profile-badges">
              <span className="profile-badge">
                {isJobSeeker ? "🏥 Healthcare Professional" : "🏢 Employer"}
              </span>
              {isEmployer && profileData.company_name && (
                <span className="profile-badge">
                  {profileData.company_name}
                </span>
              )}
              {isJobSeeker && profileData.specialization && (
                <span className="profile-badge">
                  {profileData.specialization}
                </span>
              )}
              {isEmployer && profileData.industry && (
                <span className="profile-badge">
                  {profileData.industry}
                </span>
              )}
            </div>
            
            <div className="profile-details">
              <p className="profile-email">
                <FaEnvelope style={{ marginRight: '8px' }} />
                {user?.email || profileData?.email || 'No email found'}
              </p>
              {profileData.phone && (
                <p className="profile-phone">
                  <FaPhone />
                  {profileData.phone}
                </p>
              )}
              {isJobSeeker && profileData.medical_license_number && (
                <p className="profile-license">
                  <FaCertificate style={{ marginRight: '8px' }} />
                  License: {profileData.medical_license_number}
                </p>
              )}
              {isEmployer && profileData.company_website && (
                <p className="profile-website">
                  <FaGlobe style={{ marginRight: '8px' }} />
                  <a href={profileData.company_website} target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                    Company Website
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-fields-container">
        <div className="profile-fields-header">
          <h2 className="profile-fields-title">Profile Information</h2>
          <p className="profile-fields-subtitle">Click "Edit" on any field to update your information</p>
        </div>

        <div className="profile-fields-grid">
  
          <ReadOnlyField label="Username" value={profileData.username} icon={FaUser} />
  
          <EditableField label="First Name" value={profileData.first_name} fieldName="first_name" icon={FaUser} placeholder="Enter your first name" isEditing={editingFields.first_name} isLoading={loading.first_name} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>
          
          <EditableField label="Last Name" value={profileData.last_name} fieldName="last_name" icon={FaUser}placeholder="Enter your last name" isEditing={editingFields.last_name} isLoading={loading.last_name} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

          <EditableField label="Phone Number"value={profileData.phone} fieldName="phone"icon={FaPhone} type="tel" placeholder="Enter your phone number" isEditing={editingFields.phone} isLoading={loading.phone} profileData={profileData}onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

          <EditableField label="Gender"value={profileData.gender} fieldName="gender" icon={FaVenusMars} type="select" placeholder="Select your gender"options={genderOptions}isEditing={editingFields.gender} isLoading={loading.gender} profileData={profileData} onInputChange={handleInputChange}onEditField={handleEditField}onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

          <EditableField label="Age"value={profileData.age ? `${profileData.age} years old` : ""}  fieldName="age" icon={FaCalendar}type="number" placeholder="Enter your age"isEditing={editingFields.age}isLoading={loading.age} profileData={profileData} onInputChange={handleInputChange}onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

          <EditableField label="Address" value={profileData.address} fieldName="address" icon={FaAddressCard}type="textarea" placeholder="Enter your address" isEditing={editingFields.address}isLoading={loading.address} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

          {isJobSeeker && (
            <>

              <EditableField label="Medical License Number"value={profileData.medical_license_number}fieldName="medical_license_number"icon={FaCertificate}placeholder="Enter your medical license number"isEditing={editingFields.medical_license_number} isLoading={loading.medical_license_number} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

              <EditableField label="Specialization"value={profileData.specialization} fieldName="specialization" icon={FaStethoscope} placeholder="Enter your medical specialization"isEditing={editingFields.specialization} isLoading={loading.specialization} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

              <EditableField label="Availability" value={profileData.availability}fieldName="availability" icon={FaClock}type="select" placeholder="Select your availability" options={availabilityOptions}isEditing={editingFields.availability}isLoading={loading.availability}profileData={profileData} onInputChange={handleInputChange}onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

              <EditableField label="Certifications"value={profileData.certifications}fieldName="certifications" icon={FaAward} type="textarea" placeholder="List your certifications" isEditing={editingFields.certifications}isLoading={loading.certifications} profileData={profileData}onInputChange={handleInputChange}onEditField={handleEditField}onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

              <EditableField label="Skills" value={profileData.skills} fieldName="skills" icon={FaGraduationCap} type="textarea" placeholder="List your skills" isEditing={editingFields.skills} isLoading={loading.skills} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField}onSaveField={handleSaveField}onCancelEdit={handleCancelEdit} />

              <EditableField label="Education" value={profileData.education} fieldName="education"icon={FaGraduationCap} type="textarea" placeholder="Describe your educational background" isEditing={editingFields.education} isLoading={loading.education} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

              <EditableField label="Work Experience" value={profileData.work_experience} fieldName="work_experience"icon={FaBriefcase} type="textarea"placeholder="Describe your work experience" isEditing={editingFields.work_experience} isLoading={loading.work_experience} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

            </>
          )}

          {isEmployer && (
            <>

              <EditableField label="Company Name" value={profileData.company_name} fieldName="company_name" icon={FaBuilding} placeholder="Enter your company name" isEditing={editingFields.company_name} isLoading={loading.company_name} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField}onSaveField={handleSaveField}onCancelEdit={handleCancelEdit} />

              <EditableField label="Industry" value={profileData.industry} fieldName="industry" icon={FaGlobe} placeholder="Enter your industry" isEditing={editingFields.industry} isLoading={loading.industry} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

              <EditableField label="Company Size" value={profileData.company_size} fieldName="company_size" icon={FaUsers} type="select" placeholder="Select company size" options={companySizeOptions} isEditing={editingFields.company_size} isLoading={loading.company_size} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

              <EditableField label="Founded Year" value={profileData.founded_year} fieldName="founded_year" icon={FaCalendar}type="number" placeholder="Enter founded year" isEditing={editingFields.founded_year} isLoading={loading.founded_year} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

              <EditableField label="Company Website" value={profileData.company_website}fieldName="company_website"icon={FaGlobe} type="url"placeholder="Enter company website URL"isEditing={editingFields.company_website} isLoading={loading.company_website} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit}/>

              <EditableField label="Headquarters Location" value={profileData.headquarters_location} fieldName="headquarters_location"icon={FaAddressCard}placeholder="Enter headquarters location" isEditing={editingFields.headquarters_location} isLoading={loading.headquarters_location}profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

              <EditableField label="Company Description" value={profileData.company_description} fieldName="company_description" icon={FaBuilding} type="textarea" placeholder="Describe your company" isEditing={editingFields.company_description} isLoading={loading.company_description} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField}onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />
          
            </>
          )}


          <EditableField label="LinkedIn Profile" value={profileData.linkedin} fieldName="linkedin" icon={FaLinkedin} type="url" placeholder="Enter your LinkedIn profile URL" isEditing={editingFields.linkedin} isLoading={loading.linkedin}profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

          <EditableField label="GitHub Profile" value={profileData.github} fieldName="github" icon={FaGithub} type="url" placeholder="Enter your GitHub profile URL" isEditing={editingFields.github} isLoading={loading.github} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

          <EditableField label="Twitter Profile" value={profileData.twitter} fieldName="twitter" icon={FaTwitter} type="url" placeholder="Enter your Twitter profile URL" isEditing={editingFields.twitter} isLoading={loading.twitter} profileData={profileData} onInputChange={handleInputChange}onEditField={handleEditField}onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

          <EditableField label="Portfolio Website" value={profileData.portfolio_website} fieldName="portfolio_website"icon={FaGlobe} type="url" placeholder="Enter your portfolio website URL" isEditing={editingFields.portfolio_website} isLoading={loading.portfolio_website} profileData={profileData} onInputChange={handleInputChange} onEditField={handleEditField} onSaveField={handleSaveField} onCancelEdit={handleCancelEdit} />

        </div>
      </div>
      {user.role === "job_seeker" && (
      <div style={{ textAlign: "center", marginTop: "5px", marginBottom: "30px" }}>
      <button
        className="generate-resume-btn"
        onClick={async () => {
          setIsLoading(true);
          try {
            const response = await fetch("http://127.0.0.1:5001/generate_resume", {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) throw new Error("Failed to generate resume");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${profileData.first_name || "User"}_Resume.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } catch (error) {
            setFlashMessage("Error generating resume. Please try again.", "error");
          } finally {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? "⏳ Generating..." : "📄 Generate Resume"}
      </button>

      {isLoading && (
        <div className="loading-spinner" style={{
          marginTop: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div className="spinner"></div>
          <p style={{ fontSize: "14px", color: "#007bff" }}>Preparing your PDF...</p>
        </div>
      )}
    </div>
    )}
    </div>
  );
};

export default Profile;
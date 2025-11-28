import axios from "axios";
import { EventSourcePolyfill } from "event-source-polyfill";

class BackendService {
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URI, 
      withCredentials: true, 
    });
  }

  async signup(formData) {
    try {
      const response = await this.api.post("/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Signup failed";
    }
  }

  async signin({ username, password }){
    try {
      const response = await this.api.post("/signin", { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: "Login failed" };
    }
  }

  async verifyOtp({ username, otp }) {
    try {
      const response = await this.api.post("/verify_otp", { username, otp },{withCredentials:true});
      return response.data;
    } catch (error) {
      throw error.response?.data || "OTP verification failed";
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get("/get_user");
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async logout() {
    try {
      const response=await this.api.post("/logout");
      return response.data;
    } catch (error) {
      console.error("Error logging out:", error);
      return null;
    }
  }

  async getAvailableJobs() {
    try {
      const response = await this.api.get("/available_jobs",{withCredentials:true});
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch jobs";
    }
  }

  async getEmployerJobs() {
    try {
      const response = await this.api.get("/your_jobs",{withCredentials:true});
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch employer jobs";
    }
  }

  async getAIJobMatches(data) {
    try {
      const response = await this.api.post("/ai-job-matcher", data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("AI Job Match Error:", error);
      throw error.response?.data || "Failed to get AI job matches";
    }
  }

  async addJob(jobData) {
    try {
      const response = await this.api.post("/add_job", jobData, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to add job";
    }
  }

  async deleteJob(jobId) {
    try {
      const response = await this.api.post(`/delete_job/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete job";
    }
  }

  async getEmployerApplications() {
    try {
      const response = await this.api.get("/employer_applications",{withCredentials:true});
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch applications";
    }
  }

  async getJobSeekerApplications() {
    try {
      const response = await this.api.get("/jobseeker_applications",{withCredentials:true});
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch job seeker applications";
    }
  }

  async applyJob(jobId, applicationData) {
    try {
      const response = await this.api.post(`/apply_job/${jobId}`, applicationData,{withCredentials:true});
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to apply for job";
    }
  }

  async deleteApplication(applicationId) {
    try {
      const response = await this.api.post(`/delete_application/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete application";
    }
  }

  async updateApplicationStatus(applicationId, status) {
    try {
      const response = await this.api.post(`/update_application/${applicationId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update application status";
    }
  }

  async getJobDetails(jobId) {
    try {
      const response = await this.api.get(`/job_details/${jobId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch job details";
    }
  }

  async verifyToken(auth_token){
    try{
      const response=await this.api.post('/verify-token',{auth_token})
      return response.data;
    }
    catch(error){
      throw error.response?.data || "Failed to fetch tokens";
    }
  } 
  
  async uploadImageToCloudinary() {
    try {
      const response = await this.api.post('/upload_image_to_cloudinary');
      return response.data.url || null;
    } catch (error) {
      throw error.response?.data || "Failed to upload image";
    }
  }

  async contact_us({name,email,phone,message}){
    try{
      const response = await this.api.post('/contact_us', { 
        name, 
        email, 
        phone, 
        message 
    }, {
        headers: { "Content-Type": "application/json" } 
    });
      return response.data
    }
    catch(error){
      throw error.response?.data || "Failed to send response email";
    }
  }

  
  async getProfile() {
    try {
      const response = await this.api.get("/profile", { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch profile";
    }
  }

  async getCurrentUserProfile() {
    try {
      const response = await this.api.get("/current_user_profile", { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch current user profile";
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.api.post("/update_profile", profileData, { withCredentials: true });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update profile";
    }
  }

  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profile_pic', file);
      const response = await this.api.post("/upload_profile_picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to upload profile picture";
    }
  }

    async chatbot(message) {
    try {
      const response = await this.api.post(
        "/chatbot",
        { message },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error("Chatbot error:", error);
      return { reply: "Something went wrong talking to AI.", action: null };
    }
  }

startChatbotStream(message, onMessage, onDone) {
    const url =
        `${import.meta.env.VITE_BACKEND_URI}/chatbot_stream?message=` +
        encodeURIComponent(message);

    // START SSE STREAM
    const evtSource = new EventSourcePolyfill(url, {
        withCredentials: true
    });

    evtSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
            evtSource.close();
            onDone && onDone();
            return;
        }

        const data = JSON.parse(event.data);
        onMessage(data);
    };

    evtSource.onerror = (err) => {
        console.error("Stream error:", err);
        evtSource.close();
    };

    return evtSource;
}


}

const backendService = new BackendService();

export default backendService;

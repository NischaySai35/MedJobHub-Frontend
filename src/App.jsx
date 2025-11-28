import './App.css'
import {Header,Footer} from './components'
import { Outlet, BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {login as authlogin,logout as authlogout} from "./store/authSlice"
import backendService from './Flask_service/flask';
import { useFlash } from "./context/FlashContext";
import { useNavigate } from 'react-router-dom';
import { Jobs, JobInfo, Home } from "./pages"; // adjust import paths
import Chatbot from "./components/Chatbot/Chatbot";


function App() {

  const dispatch=useDispatch();
  useEffect(() => {
    const verifyAuthToken = async () => {
        const token = localStorage.getItem("authToken");

        if (token) {
            try {
                const response = await backendService.verifyToken(token);

                if (response.success) {
                    dispatch(authlogin({ userData: response.user })); 
                } else {
                    localStorage.removeItem("userData");
                    localStorage.removeItem("authToken");
                    dispatch(authlogout());
                }
            } catch (error) {
                console.error("Error verifying token:", error);
                localStorage.removeItem("userData");
                localStorage.removeItem("authToken");
                dispatch(authlogout());
            }
        }
      // else{
      //   setFlashMessage("Welcome! Please log in to access your account and explore all features.", "info");
      //   navigate("/signin")
      // }

    };

    verifyAuthToken();
}, [dispatch]);

  return (
    <>
        <Header />
        <Chatbot />
        <main>
        <Outlet/>
        </main>
        <Footer />
    </>
  )
}

export default App

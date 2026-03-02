import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../components/AuthContext";

const REISSUE_URL = process.env.REACT_APP_REISSUE_URL;

const LoginSuccessPage = () => {
  const navigate = useNavigate();
  const { updateToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const reissueToken = async () => {
      try {
        // Show loading state
        console.log("Requesting new access token...");

        // Make POST request to /reissue endpoint
        const response = await axios.post(REISSUE_URL, {}, { withCredentials: true });

        // Extract the new access token from the response header
        const newAccessToken = response.headers["authorization"]?.replace("Bearer ", "");

        if (!newAccessToken) {
          throw new Error("No access token received from server");
        }

        console.log("Successfully received new access token");

        // Remove old access token and store the new one
        localStorage.removeItem("accessToken");
        updateToken(newAccessToken);

        // Redirect to root page
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Failed to reissue token:", err);
        setError("Failed to authenticate. Please try logging in again.");
      }
    };

    reissueToken();
  }, [navigate, updateToken]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication in progress...</h2>
        <p className="text-gray-600 mb-4">Please wait while we complete your authentication.</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccessPage;

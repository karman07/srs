import React, { useEffect, useState } from "react";
import "./SplashScreen.css"; // Import custom styles
import Img1 from '../assets/tpc_logo.png'
const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeOut(true), 3000); // Start fade-out after 3s
    setTimeout(onFinish, 4000); // Remove splash after 4s
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <img src={Img1} alt="Logo" className="logo-animation" />
      <div className="loader"></div>
    </div>
  );
};

export default SplashScreen;

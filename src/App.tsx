import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import UserForm from "./components/UserForm";
import ThankYouPage from "./components/ThankYouPage";

const App: React.FC = () => {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const registeredUser = localStorage.getItem("userRegistered");
    if (registeredUser) {
      setIsRegistered(true);
    }
  }, []);

  return (
    <>
      {!isSplashFinished ? (
        <SplashScreen onFinish={() => setIsSplashFinished(true)} />
      ) : isRegistered ? (
        <ThankYouPage />
      ) : (
        <UserForm onRegister={() => setIsRegistered(true)} />
      )}
    </>
  );
};

export default App;

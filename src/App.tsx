import React, { useState, useEffect } from "react";
import Splash from "./components/SplashScreen";
import TeacherForm from "./components/TeacherRegister";
import ThankYou from "./components/ThankYou";

const App: React.FC = () => {
  const [screen, setScreen] = useState("splash"); // splash → form → thankyou

  useEffect(() => {
    setTimeout(() => setScreen("form"), 2000); // Splash screen for 2 sec
  }, []);

  return (
    <>
      {screen === "splash" && <Splash />}
      {screen === "form" && <TeacherForm setScreen={setScreen} />}
      {screen === "thankyou" && <ThankYou />}
    </>
  );
};

export default App;

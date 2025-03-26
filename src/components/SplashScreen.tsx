import React from "react";

const Splash: React.FC = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-dark">
      <h1 className="text-white fw-bold">Welcome to Teacher Registration</h1>
      <div className="spinner-border text-success mt-3" role="status"></div>
    </div>
  );
};

export default Splash;

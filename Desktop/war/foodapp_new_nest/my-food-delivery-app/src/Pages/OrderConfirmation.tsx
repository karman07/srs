import React from "react";
import { Link } from "react-router-dom";

const OrderConfirmation: React.FC = () => {
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center p-4 border rounded shadow-sm w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-danger">Thank You!</h2>
        <p className="mb-4">Your order has been placed successfully.</p>
        <Link 
          to={`/${localStorage.getItem("tableNumber")}`} 
          className="btn btn-danger w-100"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;

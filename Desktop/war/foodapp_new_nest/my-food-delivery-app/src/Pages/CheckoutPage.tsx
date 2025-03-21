import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { clearCart } from "../store/cartSlice";
import "bootstrap/dist/css/bootstrap.min.css";
import { BASE_URL_APP } from "../Base/baseurl";
import { useData } from "../context/DataContext";
import { RootState } from "../store";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}


const CheckoutPage: React.FC = () => {
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerNumber, setCustomerNumber] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<string>("");
  const [table, setTable] = useState<string | null>(
    localStorage.getItem("tableNumber") || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"online" | "offline">("online");
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const { totalPrice } = useData();

  const cartItems = useSelector((state: RootState) => state.cart.items);
 // console.log(cartItems);
  const paymentStatus = paymentMethod === "online" ? "completed" : "pending";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load Razorpay script dynamically for Vite compatibility
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay script loaded");
      script.onerror = () => console.error("Failed to load Razorpay script");
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);

  const handleConfirmOrder = async () => {
    if (!isConfirmed) {
      alert("Please confirm that you are at least 18 years old.");
      return;
    }

    if (!customerName || !customerNumber || !table) {
      alert("Please fill in all required fields.");
      return;
    }

    // console.log(cartItems.map((item) => ({
    //   menuItemId: item._id,
    //   quantity: item.quantity,
    // })))

    const orderData = {
      customerName,
      customerEmail,
      customerNumber,
      orderDetails,
      menuItems: cartItems.map((item) => ({
        menuItemId: item.productId,
        quantity: item.quantity,
      })),
      totalPrice,
      table,
      paymentStatus,
      paymentMethod: paymentMethod === "online" ? "Online" : "COD",
    };

    if (paymentMethod === "online") {
      initiateRazorpayPayment(orderData);
    } else {
      try {
        const response = await axios.post(`${BASE_URL_APP}/orders`, orderData);
        console.log(cartItems.map((item) => ({
          menuItemId: item.productId,
          quantity: item.quantity,
        })))
          const num = Number(localStorage.getItem("order_n"));
          console.log(num);
          if (num !== null) {
            localStorage.setItem(String(num + 1), JSON.stringify(response.data)); 
            console.log(response.data)
            localStorage.setItem("order_n" , String(num+1))
          }
         else {
          localStorage.setItem("1", JSON.stringify(response.data));
          console.log(response.data)
          localStorage.setItem("order_n" , "1");
         }       
        dispatch(clearCart());
        alert("Your order has been placed successfully!");
        navigate("/order-confirmation");
      } catch (error) {
        console.error("Error placing order:", error);
        alert("Failed to place order.");
      }
    }
  };

  const initiateRazorpayPayment = async (orderData: any) => {
    try {
      const response = await axios.post(`${BASE_URL_APP}/payment/create-order`, {
        amount: totalPrice * 100,
      });

      const { id: order_id, amount, currency } = response.data;

      if (!(window as any).Razorpay) {
        alert("Failed to load Razorpay. Please refresh and try again.");
        return;
      }

      const options = {
        key: "rzp_test_TJOrQglqT6B38A",
        amount,
        currency,
        name: "My Store",
        description: "Purchase",
        order_id,
        handler: async (response: any) => {
          try {
            orderData.paymentDetails = response;
            await axios.post(`${BASE_URL_APP}/orders`, orderData);
            
          const num = Number(localStorage.getItem("order_n"));
          if (num !== null) {
            localStorage.setItem(String(num + 1), JSON.stringify(response.data)); 
            console.log(response.data)
          }
         else {
          localStorage.setItem("1", JSON.stringify(response.data));
          console.log(response.data) 
         }  
            dispatch(clearCart());
            alert("Payment successful! Order placed.");
            navigate("/order-confirmation");
          } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed. Try again.");
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail || "customer@example.com",
          contact: customerNumber,
        },
        theme: {
          color: "#198754",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initiating Razorpay:", error);
      alert("Failed to start payment.");
    }
  };

  return (
    <div className="container mt-5 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7">
          <div className="border rounded p-4 mb-4">
            <h3>Delivery Details</h3>
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Customer Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
            <input
              type="tel"
              className="form-control mb-3"
              placeholder="Customer Number *"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
            />
            <textarea
              className="form-control mb-3"
              placeholder="Order Details"
              value={orderDetails}
              onChange={(e) => setOrderDetails(e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Table Number *"
              value={table || ""}
              onChange={(e) => setTable(e.target.value)}
            />
          </div>

        
          <div className="border rounded p-4">
            <h3>Payment Method</h3>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "online" | "offline")}
            >
              <option value="online">Online Payment</option>
              <option value="offline">Cash on Delivery</option>
            </select>
          </div>
        </div>

       
        <div className="col-12 col-md-5 mt-4 mt-md-0">
          <div className="border rounded p-4">
            <h4>Order Summary</h4>
            <p>
              Subtotal ({cartItems.length} items):{" "}
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </p>
            <h5>
              Total: <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
            </h5>

            <div className="form-check mt-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={isConfirmed}
                onChange={() => setIsConfirmed(!isConfirmed)}
              />
              <label className="form-check-label">
                I confirm that I am at least 18 years old.
              </label>
            </div>

            <button
              className="btn btn-danger w-100 mt-3"
              onClick={handleConfirmOrder}
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

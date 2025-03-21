import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Delivery from "../assets/img/delivery.png";
import HeroBg from "../assets/img/heroBg.png";
import { useData } from "../context/DataContext";
import "./Hero.css";
import { Item } from "../types/types";

const HomeContainer: React.FC = () => {
  const [marginTop, setMarginTop] = useState(window.innerWidth <= 768 ? 100 : 50);
  const { menuItems } = useData();
  const menuItem = menuItems.slice(0, 4);

  useEffect(() => {
    const handleResize = () => {
      setMarginTop(window.innerWidth <= 768 ? 100 : 50);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.section
      id="home"
      className="home-container"
      style={{ marginTop: `${marginTop}px` }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.img 
        src={HeroBg} 
        alt="Hero Background" 
        className="home-bg-image"
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <div className="home-content">
        <div className="left-content">
          <motion.div
            className="delivery-badge"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>Bike Delivery</p>
            <div className="delivery-icon">
              <img src={Delivery} alt="Delivery" />
            </div>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            The Fastest Delivery in <br />
            <span>Your City</span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            Enjoy the fastest and most reliable delivery services available in your city.
          </motion.p>

          <motion.button
            className="order-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Order Now
          </motion.button>
        </div>

        <div className="hero-items-container">
          {menuItem.map((item: Item) => (
            <motion.div
              key={item._id}
              className="hero-item-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * (menuItem.indexOf(item) + 1) }}
              whileHover={{ scale: 1.05 }}
            >
              <img src={item.imageUrl} alt={item.name} className="hero-item-image" />
              <h6 className="hero-item-title">{item.name}</h6>
              <p className="hero-item-desc">{item.crusine}</p>
              <p className="hero-item-price">${item.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default HomeContainer;

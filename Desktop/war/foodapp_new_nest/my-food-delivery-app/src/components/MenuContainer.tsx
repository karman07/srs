import React, { useEffect, useState } from "react";
import { IoFastFood } from "react-icons/io5";
import { motion } from "framer-motion";
import RowContainer from "./RowContainer";
import { Item } from "../types/types";
import { categories } from "../utils/data";
import { useData } from "../context/DataContext";

const MenuContainer: React.FC = () => {
  const [filter, setFilter] = useState<string>("chicken");
  const [foodItems, setFoodItems] = useState<Item[]>([]);
  const { menuItems } = useData();

  // Update foodItems once menuItems is populated
  useEffect(() => {
    if (menuItems.length) {
      setFoodItems(menuItems);
    }
  }, [menuItems]);

  // Update filtered items when filter changes
  const filteredItems = foodItems.filter((n) => n.crusine === filter);

  useEffect(() => {
    console.log("Filter:", filter);
    console.log("Menu Items:", menuItems);
    console.log("Filtered Items:", filteredItems);
  }, [filter, foodItems]);

  return (
    <section className="container my-5" id="menu">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-capitalize fw-bold position-relative d-inline-block mb-4">
          Our Hot Dishes
          <span className="position-absolute start-0 bottom-0 w-25 h-2 bg-warning"></span>
        </h2>
      </div>

      {/* Category Selection */}
      <div className="d-flex justify-content-center flex-wrap gap-3 py-3">
        {categories.map((category) => (
          <motion.div
            whileTap={{ scale: 0.75 }}
            key={category._id}
            className={`d-flex flex-column align-items-center justify-content-center rounded shadow ${
              filter === category.urlParamName ? "bg-danger" : "bg-light"
            } p-3`}
            style={{
              minWidth: "94px",
              height: "112px",
              cursor: "pointer",
            }}
            onClick={() => setFilter(category.urlParamName)}
          >
            <div
              className={`d-flex align-items-center justify-content-center rounded-circle shadow ${
                filter === category.urlParamName ? "bg-white" : "bg-danger"
              }`}
              style={{ width: "40px", height: "40px" }}
            >
              <IoFastFood
                className={`${
                  filter === category.urlParamName ? "text-dark" : "text-white"
                }`}
                size={20}
              />
            </div>
            <p
              className={`mt-2 text-center fw-bold ${
                filter === category.urlParamName ? "text-white" : "text-dark"
              }`}
            >
              {category.name}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filtered RowContainer */}
      <div className="mt-4">
        <RowContainer flag={false} data={filteredItems} scrollValue={0} />
      </div>
    </section>
  );
};

export default MenuContainer;

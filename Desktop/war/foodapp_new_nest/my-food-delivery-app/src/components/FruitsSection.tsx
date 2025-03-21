import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import RowContainer from "./RowContainer"; // Adjust import path based on your project structure
import { Item } from "../types/types";

interface FruitsSectionProps {
  foodItems: Item[];
}

const FruitsSection: React.FC<FruitsSectionProps> = ({ foodItems}) => {
  const [scrollValue, setScrollValue] = useState<number>(0);

  return (
    <section className="container my-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="fs-4 fw-semibold text-capitalize position-relative">
          Our fresh & healthy Chicken
          <span
            className="position-absolute d-block w-25"
            style={{
              height: "4px",
              background: "linear-gradient(to right,rgb(255, 227, 211),rgb(220, 53, 69)",
              bottom: "-4px",
              left: "0",
            }}
          ></span>
        </h2>

        {/* Navigation Buttons */}
        <div className="d-none d-md-flex gap-2">
          <motion.button
            whileTap={{ scale: 0.75 }}
            className="btn btn-danger d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "40px", height: "40px" }}
            onClick={() => setScrollValue(-200)}
          >
            <MdChevronLeft size={20} className="text-white" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.75 }}
            className="btn btn-danger d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "40px", height: "40px" }}
            onClick={() => setScrollValue(200)}
          >
            <MdChevronRight size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      <RowContainer
        scrollValue={scrollValue}
        flag={true}
        data={foodItems
          ?.filter((item) => item.crusine === "chicken")}
      />
    </section>
  );
};

export default FruitsSection;

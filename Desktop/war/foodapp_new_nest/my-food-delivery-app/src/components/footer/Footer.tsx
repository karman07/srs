import React from "react";
import "./Footer.css";
import { FaInstagram, FaFacebookF, FaTwitter, FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="footer-container">
      {/* Newsletter Section */}
      <div className="newsletter-section">
        <h2>Stay in touch with us</h2>
        <p>Receive the latest updates about our products & promotions</p>
        <div className="newsletter-input">
          <input type="email" placeholder="Your email" />
          <button>Subscribe</button>
        </div>
      </div>

      <hr />

      {/* Footer Content */}
      <div className="footer-content">
        <div className="footer-column">
          <h3>Katil</h3>
          <p>
            With a wide selection of fresh produce, pantry staples, and household essentials, we've got everything you need just a click away.
          </p>
          <div className="social-icons">
            <FaInstagram />
            <FaFacebookF />
            <FaTwitter />
            <FaTelegramPlane />
            <FaWhatsapp />
          </div>
        </div>

        <div className="footer-column">
          <h3>Categories</h3>
          <ul>
            <li>Weekly sale</li>
            <li>Special price</li>
            <li>Easter is coming</li>
            <li>Italian dinner</li>
            <li>Fresh fruits</li>
            <li>Exotic fruits</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <ul>
            <li>Blog and news</li>
            <li>About us</li>
            <li>FAQ page</li>
            <li>Contact us</li>
            <li>Careers</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Account</h3>
          <ul>
            <li>Your account</li>
            <li>Shipping & policies</li>
            <li>Refunds & replacements</li>
            <li>Order tracking</li>
            <li>Delivery info</li>
            <li>Taxes & fees</li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Customer Service</h3>
          <ul>
            <li>Payment methods</li>
            <li>Money back guarantee</li>
            <li>Refunds & replacements</li>
            <li>Order tracking</li>
            <li>Delivery info</li>
            <li>Shipping</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import './App.css';
import { Link } from "react-router-dom";
function Homepage() {
  return (
    <div>
      <section className="intro">
        <h1>Welcome to the Smart Intern Management</h1>
        <p>We welcome you to learn and explore technologies with us</p>
        <Link to="/about-us" className="btn">
          Learn More
        </Link>
      </section>
      <section className="login-register">
        <div className="card">
          <h2>Login</h2>
          <p>Already have an account? Log in to access your profile and manage tasks.</p>
          <Link to="/login" className="btn">Login</Link>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-links">
          <Link to="/contact-us">Contact Us</Link> |{" "}
          <Link to="/terms">Terms & Conditions</Link> |{" "}
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="social-media">
          <a href="#" className="social-icon">Facebook</a>
          <a href="#" className="social-icon">Twitter</a>
          <a href="#" className="social-icon">LinkedIn</a>
        </div>
        <div className="contact-info">
          <p>Email: support@sim.com | Phone: +1 234 567 890</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;
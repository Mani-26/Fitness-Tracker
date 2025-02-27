import React, { useState } from "react";
// import axios from "axios";
import { UserContact } from "../api";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    sub: "",
    number:"",
    message: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await UserContact(formData); // Make the API call
      setResponseMessage(response.data.message); // Display success message
      setError("");
      setFormData({ fullName: "", email: "", sub:"",number:"",message: "" }); // Reset form
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send message. Try again.");
      setResponseMessage("");
    }
  };
  

  return (
    <div style={{ maxWidth: "600px",overflow:"scroll",  margin: "30px auto", padding: "20px", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}>
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          style={{ width: "96%", margin: "10px 0", padding: "10px" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: "96%", margin: "10px 0", padding: "10px" }}
        />
        <input
          type="text"
          name="sub"
          placeholder="Subject"
          value={formData.sub}
          onChange={handleChange}
          required
          style={{ width: "96%", margin: "10px 0", padding: "10px" }}
        />
        <input
          type="tel"
          name="number"
          placeholder="Phone Number"
          value={formData.number}
          onChange={handleChange}
          required
          style={{ width: "96%", margin: "10px 0", padding: "10px" }}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          rows="6"
          required
          style={{ width: "96%", margin: "10px 0", padding: "10px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px", background: "#007bff", color: "#fff", border: "none" }}>
          Send Message
        </button>
      </form>
      {responseMessage && <p style={{ color: "green" }}>{responseMessage}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Contact;

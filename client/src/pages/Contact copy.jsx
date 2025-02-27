import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await fetch('/api/user/contact', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     if (response.ok) {
  //       alert('Message sent successfully!');
  //       setFormData({ fullName: '', email: '', message: '' });
  //     } else {
  //       alert('Failed to send the message. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //     alert('An error occurred. Please try again.');
  //   }
  // };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:8080/api/user/contact', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      alert('Message sent successfully!');
      setFormData({ fullName: '', email: '', message: '' });
    } else {
      alert('Failed to send the message. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('An error occurred. Please try again.');
  }
};


  return (
    <div className="contact-form-container">
      <h2 className="text-2xl font-semibold text-white mb-4">
        Want to work with us?
      </h2>
      <form
        className="bg-gray-300 p-6 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label className="block text-black text-sm font-bold mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Full Name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Email"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-black text-sm font-bold mb-2">
            Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            rows="4"
            placeholder="Type a message..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;

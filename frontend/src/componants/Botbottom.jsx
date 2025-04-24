import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg"; // make sure the path is correct

const Botbottom = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/chatbot");
  };

  return (
    <img
      src={logo}
      alt="Chatbot Logo"
      onClick={handleClick}
      className="fixed bottom-4 right-4 w-12 h-12 rounded-full object-cover cursor-pointer shadow-lg transition-all z-50"
    />
  );
};

export default Botbottom;

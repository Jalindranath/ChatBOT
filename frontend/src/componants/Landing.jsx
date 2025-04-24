import React from "react";
import sanjivaniImg from "../assets/sanjivani.jpg"; // Make sure the path is correct

const Landing = () => {
  return (
    <section
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-center"
      style={{
        backgroundImage: `url(${sanjivaniImg})`,
      }}
    >
      <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
        Welcome to Our Website
      </h1>
      <p className="text-lg text-white drop-shadow-md">
        This is the landing page content.
      </p>
    </section>
  );
};

export default Landing;

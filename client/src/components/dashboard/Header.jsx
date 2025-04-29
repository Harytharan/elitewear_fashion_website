// Header section.js
import React from "react";
import { FaSearch, FaBell } from "react-icons/fa";

export default function Header() {
  return (
    <header className="bg-PrimaryColor pt-4 flex justify-between items-center">
      <div className="flex items-center"></div>
      <div className="flex items-center">
        <FaSearch className="text-DarkColor mr-3" />
        
        <FaBell className="text-DarkColor mr-4 cursor-pointer" />
      </div>
    </header>
  );
}

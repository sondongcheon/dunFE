import React from "react";
import { useNavigate } from "react-router-dom";

const MenuDropdown = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 pl-4 border-l-2 border-b-2 border-gray-500 space-y-4 py-4">
        <p 
          onClick={() => navigate("/test1")}
          className="cursor-pointer hover:underline py-2"
        >
          📄 Test1
        </p>
        <p 
          onClick={() => navigate("/notice")}
          className="cursor-pointer hover:underline py-2"
        >
          📄 공지사항
        </p>
      </div>
    </div>
  );
};

export default MenuDropdown;

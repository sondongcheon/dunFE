import React from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { CONTENT_IDS } from "../constants";

/**
 * content 페이지용 사이드바. path variable (a~e) 메뉴 포함.
 */
function ContentSidebar() {
  const { id } = useParams();
  const currentId = id && Object.keys(CONTENT_IDS).includes(id) ? id : "a";

  return (
    <Sidebar>
      <nav className="py-2 space-y-1 text-sm">
        <div className="font-medium text-gray-900 dark:text-white py-1">사이드 메뉴</div>
        {Object.entries(CONTENT_IDS).map(([key, value]) => {
          const isActive = currentId === key;
          return (
            <Link
              key={key}
              to={`/content/${key}`}
              className={`block py-1 hover:text-gray-900 dark:hover:text-white ${
                isActive
                  ? "font-semibold text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {value}
            </Link>
          );
        })}
      </nav>
    </Sidebar>
  );
}

export default ContentSidebar;

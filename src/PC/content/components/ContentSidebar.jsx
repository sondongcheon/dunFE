import React from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { CONTENT_IDS, CONTENT_BG_IMAGES } from "../constants";

/**
 * content 페이지용 사이드바. path variable (a~e) 메뉴 포함.
 */
function ContentSidebar() {
  const { id } = useParams();
  const currentId = id && Object.keys(CONTENT_IDS).includes(id) ? id : "azure_main";

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
              className={`flex flex-col min-h-[44px] p-1 border border-gray-200 dark:border-gray-700 rounded-lg mb-1 last:mb-0 ${
                isActive
                  ? "ring-2 ring-blue-500 dark:ring-blue-400"
                  : "hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600"
              }`}
            >
              <div
                className="flex-1 min-h-0 rounded-lg overflow-hidden w-full relative"
                style={{
                  backgroundImage: CONTENT_BG_IMAGES[key] ? `url(${CONTENT_BG_IMAGES[key]})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center 15%",
                }}
              >
                <span className="absolute inset-0 bg-black/55 rounded-lg" aria-hidden />
                <span className={`relative z-10 flex items-center px-2 py-2 text-base ${isActive ? "font-semibold text-white" : "text-gray-200 dark:text-gray-300 hover:text-white"}`}>
                  {value}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </Sidebar>
  );
}

export default ContentSidebar;

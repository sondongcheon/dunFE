import React from "react";

/**
 * PC content용 사이드바. 레이아웃 비율 15%.
 * @param {React.ReactNode} children - 사이드바 내용
 * @param {string} className - 추가 클래스
 */
function Sidebar({ children, className = "" }) {
  return (
    <aside
      className={`w-[15%] min-w-[120px] shrink-0 border-r border-gray-200 dark:border-gray-700 pr-4 ${className}`}
    >
      {children}
    </aside>
  );
}

export default Sidebar;

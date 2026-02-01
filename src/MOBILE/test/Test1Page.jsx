import React from "react";
import { Link } from "react-router-dom";

function Test1Page() {
  return (
    <div className="mainMobileBody">
      <h1 className="size-font-2xl">MOBILE - Test1 페이지</h1>
      <p className="size-font-sm">모바일 전용 Test1 콘텐츠입니다.</p>
      <nav className="size-font-xxs" style={{ marginTop: 16 }}>
        <Link to="/" className="normalBtm" style={{ marginRight: 8 }}>메인</Link>
        <Link to="/test2" className="normalBtm">공지사항</Link>
      </nav>
    </div>
  );
}

export default Test1Page;

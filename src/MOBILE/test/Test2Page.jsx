import React from "react";
import { Link } from "react-router-dom";

function Test2Page() {
  return (
    <div className="mainMobileBody">
      <h1 className="size-font-2xl">MOBILE - Test2 페이지</h1>
      <p className="size-font-sm">모바일 전용 Test2 콘텐츠입니다.</p>
      <nav className="size-font-xxs" style={{ marginTop: 16 }}>
        <Link to="/" className="normalBtm" style={{ marginRight: 8 }}>메인</Link>
        <Link to="/test1" className="normalBtm" style={{ marginRight: 8 }}>Test1</Link>
        <Link to="/test3" className="normalBtm">Test3</Link>
      </nav>
    </div>
  );
}

export default Test2Page;

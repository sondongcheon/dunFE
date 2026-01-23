import React from "react";
import { Link } from "react-router-dom";

function TestPage() {
  return (
    <div className="mainMobileBody">
      <h1 className="size-font-2xl">MOBILE - 임시 메인 페이지</h1>
      <p className="size-font-sm">모바일 환경 테스트 페이지입니다.</p>
      <nav className="size-font-xxs" style={{ marginTop: 16 }}>
        <Link to="/test1" className="normalBtm" style={{ marginRight: 8 }}>Test1</Link>
        <Link to="/test2" className="normalBtm" style={{ marginRight: 8 }}>Test2</Link>
        <Link to="/test3" className="normalBtm">Test3</Link>
      </nav>
    </div>
  );
}

export default TestPage;

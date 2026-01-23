import React from "react";
import { Link } from "react-router-dom";

function TestPage() {
  return (
    <div className="mainbody">
      <h1 className="size-font-2xl">PC - 임시 메인 페이지</h1>
      <p className="size-font-sm">PC 환경 테스트 페이지입니다.</p>
      <nav className="size-font-xxs mt-4">
        <Link to="/test1" className="normalBtm mr-2">Test1</Link>
        <Link to="/test2" className="normalBtm mr-2">Test2</Link>
        <Link to="/test3" className="normalBtm">Test3</Link>
      </nav>
    </div>
  );
}

export default TestPage;

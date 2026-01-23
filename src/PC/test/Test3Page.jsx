import React from "react";
import { Link } from "react-router-dom";

function Test3Page() {
  return (
    <div className="mainbody">
      <h1 className="size-font-2xl">PC - Test3 페이지</h1>
      <p className="size-font-sm">PC 전용 Test3 콘텐츠입니다.</p>
      <nav className="size-font-xxs mt-4">
        <Link to="/" className="normalBtm mr-2">메인</Link>
        <Link to="/test1" className="normalBtm mr-2">Test1</Link>
        <Link to="/test2" className="normalBtm">Test2</Link>
      </nav>
    </div>
  );
}

export default Test3Page;

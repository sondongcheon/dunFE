import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// PC 페이지
import PCTestPage from "./PC/test/TestPage";
import PCTest1Page from "./PC/test/Test1Page";
import PCTest2Page from "./PC/test/Test2Page";
import PCContentMainPage from "@/PC/content/contentMain";
import PCContentDetailPage from "@/PC/content/contentDetail";

// MOBILE 페이지
import MobileTestPage from "./MOBILE/test/TestPage";
import MobileTest1Page from "./MOBILE/test/Test1Page";
import MobileTest2Page from "./MOBILE/test/Test2Page";
import MobileContentMainPage from "./MOBILE/content/contentMain";
import MobileContentDetailPage from "./MOBILE/content/contentDetail";

// PC 헤더 / 모바일 하단 Nav
import PCMainNav from "./PC/common/MainNav";
import MobileBottomNav from "./MOBILE/common/BottomNav";

// 도메인 기반 PC/모바일 분기
const isMobileDomain = () => {
  const hostname = window.location.hostname;

  if (hostname.startsWith("m.")) return true;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("mobile") === "true") return true;

  return false;
};

// 경로별 PC · MOBILE 컴포넌트 매핑 (추가 페이지는 여기만 확장)
const ROUTE_MAP = [
  { path: "/", PC: PCTestPage, MOBILE: MobileTestPage },
  { path: "/test1", PC: PCTest1Page, MOBILE: MobileTest1Page },
  { path: "/notice", PC: PCTest2Page, MOBILE: MobileTest2Page },
  { path: "/content", PC: PCContentMainPage, MOBILE: MobileContentMainPage },
  { path: "/content/:id", PC: PCContentDetailPage, MOBILE: MobileContentDetailPage },
];

function Router() {
  const isMobile = isMobileDomain();

  return (
    <BrowserRouter>
      {isMobile ? <MobileBottomNav /> : <PCMainNav />}
      
      <Routes>
        {ROUTE_MAP.map(({ path, PC, MOBILE }) => (
          <Route
            key={path}
            path={path}
            element={isMobile ? <MOBILE /> : <PC />}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

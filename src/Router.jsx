import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// PC 페이지
import PCTestPage from "./PC/test/TestPage";
import PCTest1Page from "./PC/test/Test1Page";
import PCTest2Page from "./PC/test/Test2Page";
import PCContentMainPage from "@/PC/content/contentMain";
import PCContentDetailPage from "@/PC/content/contentDetail";
import PCContentPartyPage from "@/PC/content/contentPartyPage";
import PCAdminPage from "@/PC/admin/AdminPage";
import PCAdminNoticePage from "@/PC/admin/AdminNoticePage";
import PCAdminTodayPage from "@/PC/admin/AdminTodayPage";
import PCCommentsPage from "@/PC/comments/CommentsPage";

// MOBILE 페이지
import MobileTestPage from "./MOBILE/test/TestPage";
import MobileTest1Page from "./MOBILE/test/Test1Page";
import MobileTest2Page from "./MOBILE/test/Test2Page";
import MobileContentMainPage from "./MOBILE/content/contentMain";
import MobileContentDetailPage from "./MOBILE/content/contentDetail";
import MobileContentPartyPage from "./MOBILE/content/contentPartyPage";
import MobileAdminPage from "./MOBILE/admin/AdminPage";
import MobileAdminNoticePage from "./MOBILE/admin/AdminNoticePage";
import MobileAdminTodayPage from "./MOBILE/admin/AdminTodayPage";
import MobileCommentsPage from "./MOBILE/comments/CommentsPage";
import PCMyInfoPage from "@/PC/myInfo/myInfoPage";
import MobileMyInfoPage from "@/MOBILE/myInfo/myInfoPage";
import PCInfoUpdatePage from "@/PC/infoupdate/InfoUpdatePage";
import MobileInfoUpdatePage from "@/MOBILE/infoupdate/InfoUpdatePage";

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
  { path: "/my-info/*", PC: PCMyInfoPage, MOBILE: MobileMyInfoPage },
  { path: "/test1", PC: PCTest1Page, MOBILE: MobileTest1Page },
  { path: "/notice", PC: PCTest2Page, MOBILE: MobileTest2Page },
  { path: "/content", PC: PCContentMainPage, MOBILE: MobileContentMainPage },
  { path: "/content/:contentName/party/:id", PC: PCContentPartyPage, MOBILE: MobileContentPartyPage },
  { path: "/content/:id", PC: PCContentDetailPage, MOBILE: MobileContentDetailPage },
  { path: "/admin", PC: PCAdminPage, MOBILE: MobileAdminPage },
  { path: "/admin/notice", PC: PCAdminNoticePage, MOBILE: MobileAdminNoticePage },
  { path: "/admin/today", PC: PCAdminTodayPage, MOBILE: MobileAdminTodayPage },
  { path: "/comments", PC: PCCommentsPage, MOBILE: MobileCommentsPage },
  { path: "/infoupdate", PC: PCInfoUpdatePage, MOBILE: MobileInfoUpdatePage },
];

function Router() {
  const isMobile = isMobileDomain();

  return (
    <BrowserRouter>
      {isMobile ? <MobileBottomNav /> : <PCMainNav />}

      <Routes>
        {ROUTE_MAP.map(({ path, PC, MOBILE }) => (
          <Route key={path} path={path} element={isMobile ? <MOBILE /> : <PC />} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

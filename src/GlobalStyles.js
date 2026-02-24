import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* 기본 body 스타일 (PC/모바일 공통 기본값) */
  body {
    min-height: 100vh;
    margin: 0;
    padding: 0;
    background-color: ${({ theme }) => theme.darkMode ? "rgb(46, 44, 34)" : "white"};
    color: ${({ theme }) => theme.darkMode ? "#ffffff" : "#000000"};
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 폰트 클래스 */
  .font-a {
    font-family: "SF_HambakSnow", sans-serif;
  }

  /* PC용 메인 컨테이너 (웹앱과 무관, 상단 고정 Nav 높이만큼 여백) */
  .mainbody {
    width: 70%;
    max-width: 1400px;
    min-height: 100vh;
    margin: 0 auto;
    margin-top: 120px; /* PC 2줄 Nav(≈113px) 아래부터 노출 */
    padding: 0 20px;
    box-sizing: border-box;
  }

  /* sm~md(1024px 미만): 전체 화면 좌우 여백 없음(모바일과 동일) */
  @media (max-width: 1023px) {
    .mainbody {
      width: 100%;
      max-width: 100%;
      padding-left: 0;
      padding-right: 0;
    }
  }

  /* PC 환경 body 스타일 (고정 너비, 웹앱 최적화 불필요) */
  @media (min-width: 1025px) {
    body {
    
      width: 1900px;
      overflow: auto;
    }
  }
    
  /* 모바일/웹앱용 메인 컨테이너 (하단 Nav 높이 반영) */
  .mainMobileBody {
    width: 100%;
    max-width: 640px;
    min-height: 100vh;
    margin: 0 auto;
    margin-top: 20px;
    padding: 0 12px 24px;
    padding-bottom: calc(3.5rem + 24px + env(safe-area-inset-bottom)); /* 하단 Nav(56px) + 여백 + iOS 안전 영역 */
    box-sizing: border-box;
  }

  /* 모바일/웹앱 환경 body 스타일 (반응형, 웹앱 최적화) */
  @media (max-width: 1024px) {
    body {
      width: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch; /* iOS 부드러운 스크롤 */
    }
  }

  /* 모바일/웹앱 화면 대응 */
  @media (max-width: 480px) {
    body {
      width: 100vw;
      /* 웹앱 설치 시 주소창 숨김 고려 */
      min-height: -webkit-fill-available;
    }

    .mainMobileBody {
      margin-top: 20px;
      padding-left: calc(12px + env(safe-area-inset-left));
      padding-right: calc(12px + env(safe-area-inset-right));
      padding-bottom: calc(3.5rem + 24px + env(safe-area-inset-bottom));
    }
  }

  /* 작은 모바일 화면 */
  @media (max-width: 360px) {
    .mainMobileBody {
      padding: 0 8px 20px;
      padding-left: calc(8px + env(safe-area-inset-left));
      padding-right: calc(8px + env(safe-area-inset-right));
      padding-bottom: calc(3.5rem + 20px + env(safe-area-inset-bottom));
    }
  }

  /* 가로 모드 대응 (웹앱) */
  @media (max-height: 500px) and (orientation: landscape) and (max-width: 1024px) {
    .mainMobileBody {
      margin-top: 20px;
      padding-bottom: calc(3.5rem + 16px + env(safe-area-inset-bottom));
    }
  }
`;

export default GlobalStyles;

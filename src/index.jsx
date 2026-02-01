import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Router from "./Router";
import reportWebVitals from "./reportWebVitals";
import GlobalStyle from "./GlobalStyles";

import { Provider, useSelector } from "react-redux";
import { ThemeProvider } from "styled-components";
import store from "./store/store";

// 모바일 접속 시 접속한 도메인 기준으로 m. 서브도메인으로 자동 전환
const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);
if (typeof window !== "undefined" && isMobileUserAgent) {
  const { hostname, protocol, port, pathname, search } = window.location;
  const hash = window.location.hash || "";

  // 이미 모바일 서브도메인(m.xxx)이면 스킵
  if (!hostname.startsWith("m.")) {
    const mobileOrigin = `${protocol}//m.${hostname}${port ? `:${port}` : ""}`;
    window.location.replace(`${mobileOrigin}${pathname}${search}${hash}`);
  }
}

const DarkModeWrapper = ({ children }) => {
  const darkMode = useSelector((state) => state.settings.darkMode);
  const theme = { darkMode };

  return (
    <ThemeProvider theme={theme}>
      <div className={darkMode ? "dark" : ""}>
        <GlobalStyle />
        {children}
      </div>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Provider store={store}>
      <DarkModeWrapper>
        <Router />
      </DarkModeWrapper>
    </Provider>
  </>
);

reportWebVitals();

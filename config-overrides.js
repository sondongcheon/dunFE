const path = require("path");

module.exports = function override(config) {
  config.resolve.alias = {
    ...config.resolve.alias,
    "@": path.resolve(__dirname, "src"),
  };

  // WebSocket 미사용: HMR용 wss://.../ws 연결 시도 제거 (연결 실패 경고 방지)
  if (config.devServer) {
    config.devServer.webSocketServer = false;
  }

  return config;
};

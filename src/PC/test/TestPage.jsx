import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CONTENT_IDS, CONTENT_BG_IMAGES } from "@/PC/content/constants";
import neopleLogo from "@/Assets/기술표기_가로형_color.png";
import { fetchTodayStats } from "@/api/homeApi";

function TestPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayCount: null,
    weekCount: null,
    totalCount: null,
    date: "",
    weekRange: "",
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchTodayStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch {
        if (!cancelled) {
          setStats({
            todayCount: 0,
            weekCount: 0,
            totalCount: 0,
            date: "",
            weekRange: "",
          });
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 메인 컨텐츠 바로가기 목록
  const mainContentKeys = [
    "inae",
    "diregie",
    "star_turtle_grand_library",
    "heretics_castle",
  ];
  const contentList = mainContentKeys.map((key) => [key, CONTENT_IDS[key]]);

  return (
    <div className="mainbody">
      <div className="max-w-5xl mx-auto relative">
        {/* 방문자 통계 - 우측 상단 구석 */}
        <div className="absolute top-0 right-0 z-10 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1.5 shadow-sm">
          {statsLoading ? (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ...
            </span>
          ) : (
            <div className="flex flex-col gap-0.5 text-xs text-gray-600 dark:text-gray-400 min-w-[6rem]">
              <span className="flex justify-between gap-3">
                <span>오늘 방문자 수</span>
                <span className="font-medium text-blue-600 dark:text-blue-400 tabular-nums">
                  {stats.todayCount != null
                    ? stats.todayCount.toLocaleString()
                    : "-"}
                </span>
              </span>
              <span className="flex justify-between gap-3">
                <span>주간 방문자 수</span>
                <span className="font-medium text-green-600 dark:text-green-400 tabular-nums">
                  {stats.weekCount != null
                    ? stats.weekCount.toLocaleString()
                    : "-"}
                </span>
              </span>
              <span className="flex justify-between gap-3">
                <span>누적 방문자 수</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                  {stats.totalCount != null
                    ? stats.totalCount.toLocaleString()
                    : "-"}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* 히어로 섹션 */}
        <section className="text-center py-12 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            DunRoot
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            던전앤파이터 파티 & 그룹 관리 서비스
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/content")}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
            >
              시작하기
            </button>
            <button
              onClick={() => navigate("/notice")}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              공지사항
            </button>
          </div>
        </section>

        {/* 주요 기능 소개 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                그룹 관리
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                캐릭터를 그룹으로 묶어 효율적으로 관리하세요
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                파티 시스템
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                다른 모험단과 함께 파티를 구성하세요
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                클리어 체크
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                콘텐츠 클리어 현황을 한눈에 확인하세요
              </p>
            </div>
          </div>
        </section>

        {/* 컨텐츠 바로가기 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            컨텐츠 바로가기
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contentList.map(([key, value]) => (
              <button
                key={key}
                onClick={() => navigate(`/content/${key}`)}
                className="flex flex-col min-h-[88px] p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div
                  className="flex-1 min-h-0 rounded-lg overflow-hidden w-full relative"
                  style={{
                    backgroundImage: CONTENT_BG_IMAGES[key]
                      ? `url(${CONTENT_BG_IMAGES[key]})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <span
                    className="absolute inset-0 bg-black/50 rounded-lg"
                    aria-hidden
                  />
                  <span className="relative z-10 flex items-center justify-center min-h-[76px] p-2 text-base font-medium text-white text-center">
                    {value}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/content")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              전체 컨텐츠 보기 →
            </button>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            © 2026 DunRoot. 던전앤파이터 유저를 위한 서비스입니다.
          </p>
          <a
            href="http://developers.neople.co.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src={neopleLogo}
              alt="Neople 오픈 API"
              className="h-12 mx-auto"
            />
          </a>
        </footer>
      </div>
    </div>
  );
}

export default TestPage;

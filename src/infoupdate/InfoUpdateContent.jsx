import React, { useCallback, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  memoUpdateByAdventureName,
  memoUpdateFromHtml,
  verifyAdminGatePassword,
} from "@/api/authApi";
import htmlCopyGuide from "@/Assets/html-copy-guide.png";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MEMO_UPDATE_CONFIRM_TEXT =
  "던담에 등록된 정보를 가져와(모험단 명 검색 기준)\n 캐릭터 추가 및 메모칸을 내 딜량으로 갱신합니다.\n\n갱신은 1분마다 1번 가능합니다. (던담에 악성 요청 방지)\n\n실행하시겠습니까 ?";

/**
 * /infoupdate 실험실 본문
 */
function InfoUpdateContent() {
  const adventureName = localStorage.getItem("adventureName") ?? "";
  const isLoggedIn = Boolean(localStorage.getItem("adventureId") && adventureName);

  const [showMemoUpdateConfirm, setShowMemoUpdateConfirm] = useState(false);
  /** 추후 API 연동 예정 — 캐릭터 순회 갱신 옵션 (UI만) */
  const [memoUpdateCharTourLike, setMemoUpdateCharTourLike] = useState(false);
  const [showMemoUpdateResult, setShowMemoUpdateResult] = useState(false);
  const [memoUpdateResultMessage, setMemoUpdateResultMessage] = useState("");
  const [isMemoUpdating, setIsMemoUpdating] = useState(false);

  const [htmlPaste, setHtmlPaste] = useState("");
  const [htmlSubmitting, setHtmlSubmitting] = useState(false);
  const [htmlSubmitMessage, setHtmlSubmitMessage] = useState(null);
  const [htmlSubmitError, setHtmlSubmitError] = useState(null);

  const [showAdminPasswordGate, setShowAdminPasswordGate] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState(null);
  const [adminGateSubmitting, setAdminGateSubmitting] = useState(false);

  const handleHtmlSubmit = useCallback(async () => {
    const html = htmlPaste.trim();
    if (!html) {
      setHtmlSubmitError("HTML을 입력해 주세요.");
      setHtmlSubmitMessage(null);
      return;
    }
    setHtmlSubmitting(true);
    setHtmlSubmitError(null);
    setHtmlSubmitMessage(null);
    try {
      const data = await memoUpdateFromHtml(html);
      setHtmlSubmitMessage(
        typeof data === "string" ? data : (data?.message ?? JSON.stringify(data ?? "완료")),
      );
    } catch (err) {
      setHtmlSubmitError(err?.response?.data?.message || err?.message || "요청에 실패했습니다.");
    } finally {
      setHtmlSubmitting(false);
    }
  }, [htmlPaste]);

  const handleMemoUpdate = useCallback(async () => {
    if (!adventureName) return;
    setIsMemoUpdating(true);
    try {
      const response = await memoUpdateByAdventureName(adventureName, memoUpdateCharTourLike);
      setMemoUpdateResultMessage(response?.message ?? "최신화가 완료되었습니다.");
      setShowMemoUpdateConfirm(false);
      setShowMemoUpdateResult(true);
    } finally {
      setIsMemoUpdating(false);
    }
  }, [adventureName, memoUpdateCharTourLike]);

  const openAdminPasswordGate = useCallback(() => {
    setAdminPassword("");
    setAdminPasswordError(null);
    setShowAdminPasswordGate(true);
  }, []);

  const closeAdminPasswordGate = useCallback(() => {
    setShowAdminPasswordGate(false);
    setAdminPassword("");
    setAdminPasswordError(null);
  }, []);

  const submitAdminPasswordGate = useCallback(async () => {
    const pwd = adminPassword.trim();
    if (!pwd) {
      setAdminPasswordError("비밀번호를 입력해 주세요.");
      return;
    }
    setAdminGateSubmitting(true);
    setAdminPasswordError(null);
    try {
      const ok = await verifyAdminGatePassword(pwd);
      if (ok) {
        setShowAdminPasswordGate(false);
        setAdminPassword("");
        setAdminPasswordError(null);
        setMemoUpdateCharTourLike(false);
        setShowMemoUpdateConfirm(true);
      } else {
        setAdminPasswordError("비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      setAdminPasswordError(
        err?.response?.data?.message ||
          err?.message ||
          "검증 요청에 실패했습니다. 네트워크와 API 주소를 확인해 주세요.",
      );
    } finally {
      setAdminGateSubmitting(false);
    }
  }, [adminPassword]);

  if (!isLoggedIn) {
    return <Navigate to="/content" replace />;
  }

  const cardBase = "rounded-2xl border bg-white shadow-sm dark:bg-gray-900/70 dark:shadow-none";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10 pb-16">
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
          실험실 ( 아직 테스트 단계의 기능들입니다. )
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          던루트에 던담 딜량 자동 입력
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          던담에서 모험단 검색 결과 HTML을 붙여넣으면 메모 칸에 자동으로 반영합니다. <br /> 컨텐츠
          이용시 나타나는 캐릭터 카드 or 내정보 에서 확인 가능합니다.
          <br /> 아래 가이드대로 복사한 뒤 전송하세요.
        </p>
      </header>

      <section className={`${cardBase} border-gray-200 dark:border-gray-700`}>
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            HTML 붙여넣기 · 전송
          </h2>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <a
            href={`https://dundam.xyz/search?server=adven&name=${encodeURIComponent(adventureName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-4 py-3 text-sm font-semibold text-blue-900 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100 dark:hover:bg-blue-950/80 sm:w-auto sm:justify-start"
          >
            <span aria-hidden>↗</span>
            던담에서 내 모험단 검색 바로 열기
          </a>

          <figure className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-950/50">
            <img
              src={htmlCopyGuide}
              alt="웹페이지 HTML 복사 가이드: F12 → Elements → body → Copy outerHTML"
              className="w-full object-contain object-top"
              loading="lazy"
              decoding="async"
            />
            <figcaption className="border-t border-gray-100 px-3 py-2 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
              F12 → Elements →{" "}
              <strong className="font-medium text-gray-700 dark:text-gray-300">&lt;body&gt;</strong>{" "}
              우클릭 → Copy → Copy outerHTML
            </figcaption>
          </figure>

          <div className="space-y-2">
            <label
              htmlFor="infoupdate-html"
              className="text-xs font-medium text-gray-600 dark:text-gray-400"
            >
              붙여넣기 (전용)
            </label>
            <textarea
              id="infoupdate-html"
              value={htmlPaste}
              onChange={(e) => setHtmlPaste(e.target.value)}
              rows={6}
              spellCheck={false}
              className="block w-full resize-y rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-2 font-mono text-[10px] leading-tight text-gray-800 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-950/40 dark:text-gray-200 dark:placeholder:text-gray-600"
              placeholder="outerHTML 붙여넣기"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleHtmlSubmit}
              disabled={htmlSubmitting}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-45 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              {htmlSubmitting ? "전송 중…" : "전송"}
            </button>
          </div>

          {htmlSubmitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            >
              {htmlSubmitError}
            </div>
          )}
          {htmlSubmitMessage && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/35 dark:text-emerald-100">
              {htmlSubmitMessage}
            </div>
          )}
        </div>
      </section>

      <section
        className={`${cardBase} border-dashed border-amber-300/90 bg-amber-50/30 dark:border-amber-700/60 dark:bg-amber-950/20`}
      >
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
          <span className="rounded-md border border-amber-400/80 bg-amber-100/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 dark:border-amber-600 dark:bg-amber-900/50 dark:text-amber-100">
            관리자용
          </span>
          <span className="rounded-md border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100">
            개발 중
          </span>
          <button
            type="button"
            onClick={openAdminPasswordGate}
            aria-label="던담 정보로 캐릭터 및 딜량 메모 최신화"
            className="rounded-lg border border-amber-500/80 bg-amber-100/90 px-3 py-1.5 text-xs font-semibold text-amber-950 transition hover:bg-amber-200/90 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-50 dark:hover:bg-amber-900/70"
          >
            실행
          </button>
        </div>
      </section>

      <Dialog
        open={showAdminPasswordGate}
        onOpenChange={(open) => {
          if (!open) closeAdminPasswordGate();
        }}
      >
        <DialogContent className="max-w-[360px] rounded-xl gap-4 p-5 dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              관리자 인증
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            이 기능을 사용할 수 있는 비밀번호를 입력하세요.
          </p>
          <input
            type="password"
            autoComplete="off"
            value={adminPassword}
            onChange={(e) => {
              setAdminPassword(e.target.value);
              setAdminPasswordError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !adminGateSubmitting) {
                e.preventDefault();
                submitAdminPasswordGate();
              }
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-950 dark:text-white"
            placeholder="비밀번호"
            aria-invalid={Boolean(adminPasswordError)}
          />
          {adminPasswordError && (
            <p className="text-sm text-red-600 dark:text-red-400">{adminPasswordError}</p>
          )}
          <DialogFooter className="flex gap-2 justify-end sm:justify-end">
            <button
              type="button"
              onClick={closeAdminPasswordGate}
              disabled={adminGateSubmitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              취소
            </button>
            <button
              type="button"
              onClick={submitAdminPasswordGate}
              disabled={adminGateSubmitting}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {adminGateSubmitting ? "확인 중…" : "확인"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMemoUpdateConfirm} onOpenChange={setShowMemoUpdateConfirm}>
        <DialogContent className="max-w-[420px] rounded-xl gap-4 p-5 dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              던담 정보로 최신화 하기
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {MEMO_UPDATE_CONFIRM_TEXT}
          </p>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-left dark:border-gray-600 dark:bg-gray-800/50">
            <input
              type="checkbox"
              checked={memoUpdateCharTourLike}
              onChange={(e) => setMemoUpdateCharTourLike(e.target.checked)}
              disabled={isMemoUpdating}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-900"
            />
            <span className="text-sm leading-snug text-gray-700 dark:text-gray-200">
              캐릭터 한번 씩 들어가서 갱신 순회 같이하기, 키면 1~2분 걸림
            </span>
          </label>
          <DialogFooter className="flex gap-2 justify-end sm:justify-end">
            <button
              type="button"
              onClick={() => setShowMemoUpdateConfirm(false)}
              disabled={isMemoUpdating}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleMemoUpdate}
              disabled={isMemoUpdating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isMemoUpdating ? "요청 중... (약 10초 소요)" : "실행"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMemoUpdateResult} onOpenChange={setShowMemoUpdateResult}>
        <DialogContent className="max-w-[420px] rounded-xl gap-4 p-5 dark:bg-gray-900 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              최신화 결과
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {memoUpdateResultMessage}
          </p>
          <DialogFooter className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowMemoUpdateResult(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              확인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InfoUpdateContent;

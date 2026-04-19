import React from "react";
import { useNavigate } from "react-router-dom";
import InfoUpdateContent from "@/infoupdate/InfoUpdateContent";

function MobileInfoUpdatePage() {
  const navigate = useNavigate();

  return (
    <div className="mainMobileBody min-h-screen bg-gradient-to-b from-gray-50/90 to-white pb-24 dark:from-gray-950 dark:to-gray-900">
      <header
        className="sticky top-0 z-10 border-b border-gray-200/90 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex h-12 max-w-[480px] items-center gap-2 px-3 mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-lg text-gray-600 touch-manipulation dark:text-gray-300"
            aria-label="뒤로"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">실험실</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[480px] px-4 pt-5">
        <InfoUpdateContent />
      </div>
    </div>
  );
}

export default MobileInfoUpdatePage;

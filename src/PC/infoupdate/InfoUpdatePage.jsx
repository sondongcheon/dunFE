import React from "react";
import InfoUpdateContent from "@/infoupdate/InfoUpdateContent";

function PCInfoUpdatePage() {
  return (
    <div className="mainbody min-h-[calc(100vh-8rem)] bg-gradient-to-b from-gray-50/90 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
        <InfoUpdateContent />
      </main>
    </div>
  );
}

export default PCInfoUpdatePage;

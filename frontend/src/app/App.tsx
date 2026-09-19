import { useEffect, useState } from "react";

import { AddPage } from "../pages/add/AddPage";
import { FeedPage } from "../pages/feed/FeedPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { SearchPage } from "../pages/search/SearchPage";
import { TopPage } from "../pages/top/TopPage";
import { api } from "../shared/api/client";

import { AppLayout } from "./AppLayout";
import { SplashScreen } from "./SplashScreen";

const MINIMUM_SPLASH_TIME = 1200;

type Page = "feed" | "search" | "top" | "add" | "profile";

export type User = {
  id: number;
  username: string | null;
  first_name: string | null;
};

export function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("top");
  const [user, setUser] = useState<User | null>(null);

  function renderPage() {
    switch (currentPage) {
      case "feed":
        return <FeedPage />;

      case "search":
        return <SearchPage />;

      case "top":
        return <TopPage />;

      case "add":
        return <AddPage />;

      case "profile":
        return <ProfilePage user={user} />;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initializeApp() {
      const minimumSplashTime = new Promise<void>((resolve) => {
        setTimeout(resolve, MINIMUM_SPLASH_TIME);
      });

      try {
        const [, currentUser] = await Promise.all([
          api.health(),
          api.me(),
          minimumSplashTime,
        ]);

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Application initialization failed:", error);
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    initializeApp();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isInitializing) {
    return <SplashScreen />;
  }

  return (
    <AppLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </AppLayout>
  );
}

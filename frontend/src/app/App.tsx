import { useEffect, useState } from "react";

import { AppLayout } from "./AppLayout";
import { SplashScreen } from "./SplashScreen";
import { api } from "../shared/api/client";
import { HomePage } from "../pages/home/HomePage";

const MINIMUM_SPLASH_TIME = 1000;

export function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [status, setStatus] = useState("Проверяем API…");

  useEffect(() => {
    let cancelled = false;

    async function initializeApp() {
      const minimumSplashTime = new Promise<void>((resolve) => {
        setTimeout(resolve, MINIMUM_SPLASH_TIME);
      });

      try {
        const [, user] = await Promise.all([
          api.health(),
          api.me(),
          minimumSplashTime,
        ]);

        if (!cancelled) {
          setStatus(
            `Вы вошли как ${user.first_name ?? user.username ?? user.id}`,
          );
        }
      } catch (error) {
        console.error("Application initialization failed:", error);

        if (!cancelled) {
          setStatus("Не удалось авторизоваться через Telegram.");
        }
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
    <AppLayout>
      <HomePage status={status} />
    </AppLayout>
  );
}

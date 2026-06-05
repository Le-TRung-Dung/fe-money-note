import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import {
  clearPasswordUnlocked,
  isPasswordUnlocked,
  isRequirePasswordEnabled,
} from "../features/auth/services/authService";

const APP_HIDDEN_AT_KEY = "money_note_app_hidden_at";

const LOCK_AFTER_MS = 1000;

function AppLockGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

    if (!currentUserId) return;

    const requirePassword = isRequirePasswordEnabled(currentUserId);

    if (!requirePassword) return;

    const isUnlockPage = location.pathname === "/unlock";
    const isPublicPage =
      location.pathname === "/" ||
      location.pathname === "/login" ||
      location.pathname === "/register" ||
      location.pathname === "/landing" ||
      location.pathname === "/forgot-password";

    if (isUnlockPage || isPublicPage) return;

    const unlocked = isPasswordUnlocked(currentUserId);

    if (!unlocked) {
      navigate("/unlock", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleHidden = () => {
      const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

      if (!currentUserId) return;
      if (!isRequirePasswordEnabled(currentUserId)) return;

      localStorage.setItem(APP_HIDDEN_AT_KEY, String(Date.now()));
    };

    const handleVisible = () => {
      const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

      if (!currentUserId) return;
      if (!isRequirePasswordEnabled(currentUserId)) return;

      const hiddenAt = Number(localStorage.getItem(APP_HIDDEN_AT_KEY) || 0);

      if (!hiddenAt) return;

      const diff = Date.now() - hiddenAt;

      if (diff >= LOCK_AFTER_MS) {
        clearPasswordUnlocked(currentUserId);

        if (location.pathname !== "/unlock") {
          navigate("/unlock", { replace: true });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleHidden();
      }

      if (document.visibilityState === "visible") {
        handleVisible();
      }
    };

    window.addEventListener("pagehide", handleHidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handleHidden);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname, navigate]);

  return null;
}

export default AppLockGuard;
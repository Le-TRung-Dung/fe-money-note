import { Navigate, Outlet, useLocation } from "react-router-dom";
import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import { isSalaryLockEnabled, isSalaryUnlocked } from "../features/auth/services/authService";

function SalaryLockGuard() {
  const location = useLocation();

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  if (!currentUserId) {
    return <Navigate to="/login" replace />;
  }

  const needLock = isSalaryLockEnabled(currentUserId);
  const unlocked = isSalaryUnlocked(currentUserId);

  if (needLock && !unlocked) {
    return (
      <Navigate
        to="/salary/unlock"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}

export default SalaryLockGuard;
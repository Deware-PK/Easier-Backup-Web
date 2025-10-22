'use client';

import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

export default function SessionWatcher() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const schedule = () => {
      const expStr = Cookies.get('SESSION_EXPIRES_AT');
      if (!expStr) return;

      const exp = Number(expStr);
      if (!Number.isFinite(exp)) return;

      const msLeft = exp - Date.now();

      const logout = () => {
        Cookies.remove('SESSION_TOKEN__DO_NOT_SHARE');
        Cookies.remove('SESSION_EXPIRES_AT');
        localStorage.removeItem('username');
        window.location.href = '/login';
      };

      if (msLeft <= 0) {
        logout();
        return;
      }

      timerRef.current = window.setTimeout(logout, msLeft);
    };

    schedule();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
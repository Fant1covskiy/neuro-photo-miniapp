import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegram() {
  // Тестовый пользователь (совпадает с заказом в базе)
  const mockUser = {
    id: 12345678,
    first_name: 'Тестовый Пользователь',
    username: 'testuser',
    language_code: 'ru',
  };

  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser>(mockUser); // По умолчанию mock

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    
    if (telegram) {
      telegram.ready();
      telegram.expand();
      setTg(telegram);
      
      // Если есть реальный пользователь - используем его
      if (telegram.initDataUnsafe.user) {
        setUser(telegram.initDataUnsafe.user);
        console.log('✅ Real Telegram user:', telegram.initDataUnsafe.user);
      } else {
        console.log('⚠️ Using mock user:', mockUser);
      }
    } else {
      console.log('⚠️ Telegram WebApp not found, using mock user');
    }
  }, []);

  return {
    tg,
    user,
    isReady: true, // Всегда готов (либо реальный либо mock)
  };
}

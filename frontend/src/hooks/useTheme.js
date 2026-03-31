import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const { isDark, toggle, init } = useThemeStore();
  
  useEffect(() => {
    init();
  }, []);

  return { isDark, toggle };
}

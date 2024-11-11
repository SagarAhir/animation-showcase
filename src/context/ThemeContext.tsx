import { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

type ThemeContextType = {
  isDark: boolean;
  backgroundColor: string;
  tintColor: string;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  backgroundColor: Colors.light.background,
  tintColor: Colors.light.tint,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const value = {
    isDark,
    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    tintColor: isDark ? Colors.dark.tint : Colors.light.tint,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
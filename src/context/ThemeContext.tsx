import { createContext, useContext, ReactNode } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

type ThemeContextType = {
  isDark: boolean;
  backgroundColor: string;
  tintColor: string;
  colors: typeof Colors.light | typeof Colors.dark;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  backgroundColor: Colors.dark.background,
  tintColor: Colors.dark.tint,
  colors: Colors.dark,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const value = {
    isDark,
    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    tintColor: isDark ? Colors.dark.tint : Colors.light.tint,
    colors: isDark ? Colors.dark : Colors.light,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

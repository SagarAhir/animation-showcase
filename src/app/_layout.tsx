import { Stack } from "expo-router";
import "react-native-reanimated";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/Colors";
import { Appearance, useColorScheme } from "react-native";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RootLayout = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleTheme = () => {
    Appearance.setColorScheme(isDark ? "light" : "dark");
  };

  return (
    <ThemeProvider>
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor={
          isDark ? Colors.dark.background : Colors.light.background
        }
      />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark
              ? Colors.dark.background
              : Colors.light.background,
          },
          headerTintColor: isDark ? Colors.dark.text : Colors.light.text,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
          animation: "slide_from_right",
          headerRight: () => (
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                marginRight: 15,
              })}
            >
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={24}
                color={isDark ? Colors.dark.text : Colors.light.text}
              />
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ headerTitle: "Animations" }} />
        <Stack.Screen
          name="preview"
          options={{ headerTitle: "Animation Preview" }}
        />
      </Stack>
    </ThemeProvider>
  );
};

export default RootLayout;

import { StyleSheet, Text, useColorScheme, View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ANIMATION_ID } from "@/constants/Constants";
import Smiley from "@/components/Smiley";
import Pointer from "@/components/Pointer";
import { Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Colors from "@/constants/Colors";
import Planet from "@/components/Planet";
import GravityCenter from "@/components/GravityCenter";
const { width } = Dimensions.get("window");

const CURSOR_SIZE = 40;

const Preview = () => {
  const { animationId } = useLocalSearchParams<{ animationId: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const renderAnimation = () => {
    switch (animationId) {
      case ANIMATION_ID.POINTER:
        return (
          <Pointer
            x={(width - CURSOR_SIZE - 40) / 2}
            y={270}
            size={CURSOR_SIZE}
            shadowCount={2}
            delay={10}
          />
        );
      case ANIMATION_ID.SMILEY:
        return <Smiley />;
      case ANIMATION_ID.PLANET:
        return <Planet />;
      case ANIMATION_ID.GRAVITY:
        return <GravityCenter />;
      default:
        return <Text>Animation not found</Text>;
    }
  };

  return (
    <GestureHandlerRootView>
      <View
        style={[
          styles.container,
          isDark ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        {renderAnimation()}
      </View>
    </GestureHandlerRootView>
  );
};

export default Preview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  darkContainer: {
    backgroundColor: Colors.dark.background,
  },
  lightContainer: {
    backgroundColor: Colors.light.background,
  },
});

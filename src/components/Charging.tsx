import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useRef } from "react";
import { Canvas, Circle, Group, vec } from "@shopify/react-native-skia";
import { useTheme } from "@/context/ThemeContext";
import { Text } from "./Themed";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface DotType {
  startX: number;
  startY: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

const { height, width } = Dimensions.get("window");

const CIRCLE_RADIUS = 100; // Radius of the main circle
const DOT_COUNT = 12; // Number of dots around the circle
const DOT_RADIUS = 2.5; // Size of each dot

const Charging = () => {
  const { colors } = useTheme();
  const [startAnimation, setStartAnimation] = React.useState(false);

  const dots = useRef(
    Array.from({ length: DOT_COUNT }, (_, index) => {
      const angle = (2 * Math.PI * index) / DOT_COUNT;
      const startX = width / 2 + CIRCLE_RADIUS * Math.cos(angle);
      const startY = height / 2 + CIRCLE_RADIUS * Math.sin(angle);
      return {
        startX,
        startY,
        x: startX,
        y: startY,
        scale: 1,
        opacity: 1,
      };
    })
  ).current;

  const AnimatedDot = ({ dot, index }: { dot: DotType; index: number }) => {
    const x = useSharedValue(dot.x);
    const y = useSharedValue(dot.y);
    const opacity = useSharedValue(dot.opacity);
    const scale = useSharedValue(dot.scale);

    useEffect(() => {
      if (startAnimation) {
        const duration = Math.random() * 5000 + 1000;
        const easing = Easing.exp;
        x.value = withRepeat(withTiming(width / 2, { duration, easing }), -1);
        y.value = withRepeat(withTiming(height / 2, { duration, easing }), -1);
        opacity.value = withRepeat(withTiming(0, { duration, easing }), -1);
        scale.value = withRepeat(withTiming(0, { duration, easing }), -1);
      }
    }, [startAnimation]);

    const derivedX = useDerivedValue(() => x.value);
    const derivedY = useDerivedValue(() => y.value);
    const derivedOpacity = useDerivedValue(() => opacity.value);
    const derivedScale = useDerivedValue(() => scale.value);
    console.log("derivedX", derivedX);
    return (
      <Circle
        key={index}
        cx={derivedX}
        cy={derivedY}
        r={DOT_RADIUS}
        color={colors.accent2}
        opacity={derivedOpacity}
        transform={[{ scale: derivedScale.value }]}
        origin={vec(dot.x, dot.y)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Canvas style={{ height, width }}>
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={CIRCLE_RADIUS}
          color={colors.white}
          style={"stroke"}
          strokeWidth={5}
        />

        <Group>
          {dots.map((dot, index) => {
            return <AnimatedDot key={index} dot={dot} index={index} />;
          })}
        </Group>
      </Canvas>
      <Pressable
        style={[styles.button, { backgroundColor: colors.gray100 }]}
        onPress={() => setStartAnimation(!startAnimation)}
      >
        <Text>{"Press to start"}</Text>
      </Pressable>
    </View>
  );
};

export default Charging;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    position: "absolute",
    bottom: 50,
    padding: 10,
    borderRadius: 5,
  },
});

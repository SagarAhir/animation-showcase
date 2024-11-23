import { StyleSheet, View } from "react-native";
import React, { useState, useEffect } from "react";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { useTheme } from "@/context/ThemeContext";
import { Circle, Canvas } from "@shopify/react-native-skia";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "@/constants/Constants";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

const CIRCLE_RADIUS = 25;

const CircleComponent = ({
  x,
  y,
  color,
  onAnimationComplete,
}: {
  x: number;
  y: number;
  color: string;
  onAnimationComplete: () => void;
}) => {
  const animX = useSharedValue(x);
  const animY = useSharedValue(y);
  const animRadius = useSharedValue(CIRCLE_RADIUS);

  useEffect(() => {
    animX.value = withTiming(WINDOW_WIDTH / 2, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
    });
    animY.value = withTiming(WINDOW_HEIGHT / 2, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
    });
    animRadius.value = withTiming(
      0,
      {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
      }
      //   (finished) => {
      //     if (finished) {
      //       runOnJS(onAnimationComplete)();
      //     }
      //   }
    );
  }, [x, y]);

  return <Circle cx={animX} cy={animY} r={animRadius} color={color} />;
};

const GravityCenter = () => {
  const { colors } = useTheme();
  const [taps, setTaps] = useState<{ x: number; y: number }[]>([]);
  const styles = themedStyleSheet(colors);

  const handleTap = (x: number, y: number) => {
    setTaps((prevTaps) => [...prevTaps, { x, y }]);
  };

  const tapGesture = Gesture.Tap().onEnd((event) => {
    runOnJS(handleTap)(event.x, event.y);
  });

  const handleAnimationComplete = (index: number) => {
    setTaps((prevTaps) => prevTaps.filter((_, i) => i !== index));
  };

  console.log("taps: ", taps.length);

  return (
    <View style={styles.container}>
      <Canvas
        style={{
          height: WINDOW_HEIGHT,
          width: WINDOW_WIDTH,
        }}
      >
        {taps.map((tap, index) => (
          <CircleComponent
            key={`dot-${tap.x}${tap.y}-${index}`}
            x={tap.x}
            y={tap.y}
            color={`rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
              Math.random() * 255
            })`}
            onAnimationComplete={() => handleAnimationComplete(index)}
          />
        ))}
      </Canvas>
      <GestureDetector gesture={tapGesture}>
        <View style={styles.tapContainer} />
      </GestureDetector>
    </View>
  );
};

export default GravityCenter;

const themedStyleSheet = (colors: typeof Colors.dark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    tapContainer: {
      position: "absolute",
      zIndex: 1,
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
    },
  });

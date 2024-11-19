import React from "react";
import { View, StyleSheet, useColorScheme, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import { Canvas, Circle, Oval, Path } from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Colors from "@/constants/Colors";

const WINDOW_WIDTH = Dimensions.get("window").width;
const WINDOW_HEIGHT = Dimensions.get("window").height;

const FACE_SIZE = 125;
const EYE_CANVAS_HEIGHT = 100;
const BALL_X = 150;
const BALL_Y = 450;
const EYE_WIDTH = 75;
const EYE_HEIGHT = 100;
const PUPIL_RADIUS = 10;

const Smiley = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const eyeX = useSharedValue(0);
  const eyeY = useSharedValue(0);

  const ballX = useSharedValue(BALL_X);
  const ballY = useSharedValue(BALL_Y);

  const maxPupilOffsetX = (EYE_WIDTH / 2 - PUPIL_RADIUS) / 2;
  const maxPupilOffsetY = (EYE_HEIGHT / 2 - PUPIL_RADIUS) / 2;

  const prevBallX = useSharedValue(BALL_X);
  const prevBallY = useSharedValue(BALL_Y);

  const smileCurve = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .onBegin(() => {
      prevBallX.value = ballX.value;
      prevBallY.value = ballY.value;
    })
    .onUpdate((e) => {
      ballX.value = Math.max(
        0,
        Math.min(WINDOW_WIDTH, prevBallX.value + e.translationX)
      );
      ballY.value = Math.max(
        0,
        Math.min(WINDOW_HEIGHT, prevBallY.value + e.translationY)
      );

      const centerX = BALL_X;
      const centerY = BALL_Y;
      const deltaX = ballX.value - centerX;
      const deltaY = ballY.value - centerY;

      eyeX.value = withSpring(
        Math.max(-maxPupilOffsetX, Math.min(maxPupilOffsetX, deltaX / 25)),
        { damping: 15 }
      );
      eyeY.value = withSpring(
        Math.max(-maxPupilOffsetY, Math.min(maxPupilOffsetY, deltaY / 25)),
        { damping: 15 }
      );

      // Update smile animation calculation to use absolute position
      const screenMidpoint = WINDOW_HEIGHT / 2;
      smileCurve.value = withSpring(ballY.value < screenMidpoint ? -1 : 1, {
        damping: 15,
      });
    });

  const animatedBallStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
  }));

  const smilePath = useDerivedValue(() => {
    const faceX = WINDOW_WIDTH / 2; // face center X
    const faceY = WINDOW_HEIGHT / 2; // face center Y

    const startX = faceX - FACE_SIZE * 0.4;
    const endX = faceX + FACE_SIZE * 0.4;
    const y = faceY + FACE_SIZE * 0.5;
    const controlY = y + 30 * smileCurve.value;

    return `M ${startX} ${y} Q ${faceX} ${controlY} ${endX} ${y}`;
  });

  const leftEyeX = useDerivedValue(() => {
    return WINDOW_WIDTH * 0.5 - EYE_WIDTH + EYE_WIDTH / 4 + eyeX.value;
  });

  const rightEyeX = useDerivedValue(() => {
    return WINDOW_WIDTH * 0.75 - EYE_WIDTH + EYE_WIDTH / 4 + eyeX.value;
  });

  const eyeYPosition = useDerivedValue(() => {
    return WINDOW_HEIGHT / 2 - EYE_HEIGHT / 4 + eyeY.value;
  });

  return (
    <GestureHandlerRootView>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        {/* Face Circle */}
        <Canvas style={{ width: WINDOW_WIDTH, height: WINDOW_HEIGHT }}>
          <Circle
            cx={WINDOW_WIDTH / 2}
            cy={WINDOW_HEIGHT / 2}
            r={FACE_SIZE}
            color={isDark ? Colors.dark.tint : Colors.light.tint}
          />
          <Path
            path={smilePath}
            strokeWidth={8}
            style="stroke"
            strokeCap="round"
            color={isDark ? Colors.dark.secondary : Colors.light.secondary}
          />
          {/* Left Eye */}
          <Oval
            x={WINDOW_WIDTH * 0.5 - EYE_WIDTH}
            y={WINDOW_HEIGHT / 2 - EYE_HEIGHT / 2}
            width={EYE_WIDTH / 2}
            height={EYE_HEIGHT / 2}
            color={isDark ? Colors.dark.secondary : Colors.light.secondary}
          />
          <Circle
            cx={leftEyeX}
            cy={eyeYPosition}
            r={PUPIL_RADIUS}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />

          {/* Right Eye */}
          <Oval
            x={WINDOW_WIDTH * 0.75 - EYE_WIDTH}
            y={WINDOW_HEIGHT / 2 - EYE_HEIGHT / 2}
            width={EYE_WIDTH / 2}
            height={EYE_HEIGHT / 2}
            color={isDark ? Colors.dark.secondary : Colors.light.secondary}
          />
          <Circle
            cx={rightEyeX}
            cy={eyeYPosition}
            r={PUPIL_RADIUS}
            color={isDark ? Colors.dark.text : Colors.light.text}
          />
        </Canvas>
      </View>
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.draggableBall, animatedBallStyle]}>
          <Canvas style={{ width: 30, height: 30 }}>
            <Circle
              cx={15}
              cy={15}
              r={15}
              color={isDark ? Colors.dark.primary : Colors.light.primary}
            />
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
  },
  pupil: {
    position: "absolute",
    width: 20,
    height: 20,
  },
  draggableBall: {
    position: "absolute",
    width: 30,
    height: 30,
    zIndex: 1000,
  },
});

export default Smiley;

import React from "react";
import { View, StyleSheet, useColorScheme, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  interpolate,
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
const BALL_X = 150;
const BALL_Y = 450;
const EYE_WIDTH = 75;
const EYE_HEIGHT = 100;
const PUPIL_RADIUS = 10;
const BALL_RADIUS = 15;

const Smiley = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const eyeX = useSharedValue(0);
  const eyeY = useSharedValue(0);

  const ballX = useSharedValue(WINDOW_WIDTH / 2 - BALL_RADIUS);
  const ballY = useSharedValue(WINDOW_HEIGHT / 2 - BALL_RADIUS - 20);

  const maxPupilOffsetX = (EYE_WIDTH / 2 - PUPIL_RADIUS) / 2;
  const maxPupilOffsetY = (EYE_HEIGHT / 2 - PUPIL_RADIUS) / 2;

  const prevBallX = useSharedValue(BALL_X);
  const prevBallY = useSharedValue(BALL_Y);

  const smileCurve = useSharedValue(0);
  const smileXCurve = useSharedValue(0);

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
        Math.max(-maxPupilOffsetX, Math.min(maxPupilOffsetX, deltaX / 20)),
        { damping: 15 }
      );
      eyeY.value = withSpring(
        Math.max(-maxPupilOffsetY, Math.min(maxPupilOffsetY, deltaY / 20)),
        { damping: 15 }
      );

      const screenMidpoint = WINDOW_HEIGHT / 2;
      smileCurve.value = withSpring(
        interpolate(
          ballY.value,
          [screenMidpoint - 200, screenMidpoint + 200],
          [-1, 1]
        ),
        {
          damping: 15,
        }
      );

      smileXCurve.value = withSpring(
        interpolate(ballX.value, [0, WINDOW_WIDTH], [-1, 1]),
        { damping: 15 }
      );
    });

  const animatedBallStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
  }));

  const smilePath = useDerivedValue(() => {
    const faceX = WINDOW_WIDTH / 2; // face center X
    const faceY = WINDOW_HEIGHT / 2; // face center Y

    const smileX = faceX + FACE_SIZE * 0.5 * smileXCurve.value;
    const startX = faceX - FACE_SIZE * 0.5;
    const endX = faceX + FACE_SIZE * 0.5;
    const y = faceY + FACE_SIZE * 0.5;
    const controlY = y + 30 * smileCurve.value;

    return `M ${startX} ${y} Q ${smileX} ${controlY} ${endX} ${y}`;
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
            color={isDark ? Colors.dark.black : Colors.light.black}
          />
          {/* Left Eye */}
          <Oval
            x={WINDOW_WIDTH * 0.5 - EYE_WIDTH}
            y={WINDOW_HEIGHT / 2 - EYE_HEIGHT / 2}
            width={EYE_WIDTH / 2}
            height={EYE_HEIGHT / 2}
            color={isDark ? Colors.dark.white : Colors.light.white}
          />
          <Circle
            cx={leftEyeX}
            cy={eyeYPosition}
            r={PUPIL_RADIUS}
            color={isDark ? Colors.dark.black : Colors.light.black}
          />

          {/* Right Eye */}
          <Oval
            x={WINDOW_WIDTH * 0.75 - EYE_WIDTH}
            y={WINDOW_HEIGHT / 2 - EYE_HEIGHT / 2}
            width={EYE_WIDTH / 2}
            height={EYE_HEIGHT / 2}
            color={isDark ? Colors.dark.white : Colors.light.white}
          />
          <Circle
            cx={rightEyeX}
            cy={eyeYPosition}
            r={PUPIL_RADIUS}
            color={isDark ? Colors.dark.black : Colors.light.black}
          />
        </Canvas>
      </View>
      <GestureDetector gesture={dragGesture}>
        <Animated.View
          style={[
            styles.draggableBall,
            animatedBallStyle,
            isDark
              ? { backgroundColor: Colors.dark.accent3 }
              : { backgroundColor: Colors.light.accent3 },
          ]}
        ></Animated.View>
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
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    zIndex: 1000,
  },
});

export default Smiley;

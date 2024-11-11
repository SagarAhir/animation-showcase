import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import { Canvas, Circle, Oval, Path } from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Colors from '@/constants/Colors';

const FACE_SIZE = 300;
const EYE_CANVAS_HEIGHT = 100;
const EYE_CANVAS_WIDTH = 80;
const BALL_X = 150;
const BALL_Y = 450;
const SCREEN_HEIGHT = 800;

const Smiley = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Shared values for eye movement
  const eyeX = useSharedValue(0);
  const eyeY = useSharedValue(0);

  // Shared values for draggable ball
  const ballX = useSharedValue(BALL_X);
  const ballY = useSharedValue(BALL_Y);

  // Constants for eye dimensions
  const eyeWidth = 75;
  const eyeHeight = 100;
  const pupilRadius = 10;
  const maxPupilOffsetX = (eyeWidth / 2 - pupilRadius) / 2;
  const maxPupilOffsetY = (eyeHeight / 2 - pupilRadius) / 2;

  // Add these shared values near your other useSharedValue declarations
  const prevBallX = useSharedValue(BALL_X);
  const prevBallY = useSharedValue(BALL_Y);

  // Add this new shared value for smile animation
  const smileCurve = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .onBegin(() => {
      prevBallX.value = ballX.value;
      prevBallY.value = ballY.value;
    })
    .onUpdate((e) => {
      ballX.value = prevBallX.value + e.translationX;
      ballY.value = prevBallY.value + e.translationY;

      const centerX = BALL_X;
      const centerY = BALL_Y;
      const deltaX = ballX.value - centerX;
      const deltaY = ballY.value - centerY;

      // Eye movement calculation remains the same
      eyeX.value = withSpring(
        Math.max(-maxPupilOffsetX, Math.min(maxPupilOffsetX, deltaX / 10)),
        { damping: 15 }
      );
      eyeY.value = withSpring(
        Math.max(-maxPupilOffsetY, Math.min(maxPupilOffsetY, deltaY / 10)),
        { damping: 15 }
      );

      // Update smile animation calculation to use absolute position
      const screenMidpoint = SCREEN_HEIGHT / 2;
      smileCurve.value = withSpring(
        (ballY.value + BALL_Y) < screenMidpoint ? 1 : -1,
        { damping: 15 }
      );
    });

  const animatedBallStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ballX.value }, { translateY: ballY.value }],
  }));

  // Animated styles for the pupils
  const animatedStyleLeftEye = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: eyeX.value }, { translateY: eyeY.value }],
    };
  });

  const animatedStyleRightEye = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: eyeX.value }, { translateY: eyeY.value }],
    };
  });

  // Replace getSmilePath function with useDerivedValue
  const smilePath = useDerivedValue(() => {
    const startX = FACE_SIZE * 0.2;
    const endX = FACE_SIZE * 0.8;
    const y = FACE_SIZE * 0.7;
    const controlY = y + 40 * smileCurve.value;
    console.log('smileCurve value:', smileCurve.value);
    return `M ${startX} ${y} Q ${FACE_SIZE / 2} ${controlY} ${endX} ${y}`;
  });

  return (
    <GestureHandlerRootView>
      <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
        {/* Face Circle */}
        <View style={styles.faceContainer}>
          <Canvas style={{ width: FACE_SIZE, height: FACE_SIZE }}>
            <Circle
              cx={FACE_SIZE / 2}
              cy={FACE_SIZE / 2}
              r={FACE_SIZE / 2}
              color={isDark ? Colors.dark.tint : Colors.light.tint}
            />
            <Path
              path={smilePath.value}
              strokeWidth={8}
              style="stroke"
              color={isDark ? Colors.dark.secondary : Colors.light.secondary}
            />
          </Canvas>

          {/* Eyes Container */}
          <View style={styles.eyesContainer}>
            {/* Left Eye (Oval Shape) */}
            <View style={styles.eyeContainer}>
              <Canvas
                style={{
                  width: EYE_CANVAS_WIDTH,
                  height: EYE_CANVAS_HEIGHT,
                }}
              >
                <Oval
                  x={(EYE_CANVAS_WIDTH - eyeWidth / 2) / 2}
                  y={(EYE_CANVAS_HEIGHT - eyeHeight / 2) / 2}
                  width={eyeWidth / 2}
                  height={eyeHeight / 2}
                  color={isDark ? Colors.dark.secondary : Colors.light.secondary}
                />
              </Canvas>
              <Animated.View style={[styles.pupil, animatedStyleLeftEye]}>
                <Canvas style={{ width: 20, height: 20 }}>
                  <Circle
                    cx={pupilRadius}
                    cy={pupilRadius}
                    r={pupilRadius}
                    color={isDark ? Colors.dark.text : Colors.light.text}
                  />
                </Canvas>
              </Animated.View>
            </View>
            {/* Right Eye (Oval Shape) */}
            <View style={styles.eyeContainer}>
              <Canvas
                style={{ width: EYE_CANVAS_WIDTH, height: EYE_CANVAS_HEIGHT }}
              >
                <Oval
                  x={(EYE_CANVAS_WIDTH - eyeWidth / 2) / 2}
                  y={(EYE_CANVAS_HEIGHT - eyeHeight / 2) / 2}
                  width={eyeWidth / 2}
                  height={eyeHeight / 2}
                  color={isDark ? Colors.dark.secondary : Colors.light.secondary}
                />
              </Canvas>
              <Animated.View style={[styles.pupil, animatedStyleRightEye]}>
                <Canvas style={{ width: 20, height: 20 }}>
                  <Circle
                    cx={pupilRadius}
                    cy={pupilRadius}
                    r={pupilRadius}
                    color={isDark ? Colors.dark.text : Colors.light.text}
                  />
                </Canvas>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.draggableBall, animatedBallStyle]}>
          <Canvas style={{ width: 30, height: 30 }}>
            <Circle cx={15} cy={15} r={15} color={isDark ? Colors.dark.primary : Colors.light.primary} />
          </Canvas>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  faceContainer: {
    width: FACE_SIZE,
    height: FACE_SIZE,
    position: 'relative',
  },
  eyesContainer: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeContainer: {
    width: EYE_CANVAS_WIDTH,
    height: EYE_CANVAS_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  pupil: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  draggableBall: {
    position: 'absolute',
    width: 30,
    height: 30,
    zIndex: 1000,
    left: -15,
    top: -15,
  },
});

export default Smiley;

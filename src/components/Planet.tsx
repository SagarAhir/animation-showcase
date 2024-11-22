import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { Canvas, Circle, Shadow } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
  useDerivedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const { height, width } = Dimensions.get("window");

const ORBIT_RADIUS = 150;
const PLANET_RADIUS = 30;

const Planet = () => {
  const { colors } = useTheme();
  const styles = themedStyleSheet(colors);

  const angle = useSharedValue(0);
  const prevAngle = useSharedValue(0);
  const moonAngle = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 10000,
        easing: Easing.linear,
      }),
      -1
    );

    moonAngle.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 5000,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(angle);
      prevAngle.value = angle.value;
    })
    .onUpdate((e) => {
      opacity.value = withTiming(0, {
        duration: 2000,
      });
      const dx = e.absoluteX - width / 2;
      const dy = e.absoluteY - height / 2;
      angle.value = Math.atan2(dy, dx);
    })
    .onEnd(() => {
      const currentAngle = angle.value % (Math.PI * 2);
      const remainingAngle =
        currentAngle <= 0
          ? Math.PI * 2 + currentAngle
          : Math.PI * 2 - currentAngle;
      const normalizedDuration = (remainingAngle / (Math.PI * 2)) * 10000;

      angle.value = withTiming(
        angle.value + remainingAngle,
        {
          duration: normalizedDuration,
          easing: Easing.linear,
        },
        () => {
          angle.value = withRepeat(
            withTiming(angle.value + Math.PI * 2, {
              duration: 10000,
              easing: Easing.linear,
            }),
            -1
          );
        }
      );
    });

  const positionX = useDerivedValue(() => {
    return width / 2 + ORBIT_RADIUS * Math.cos(angle.value);
  });

  const positionY = useDerivedValue(() => {
    return height / 2 + ORBIT_RADIUS * Math.sin(angle.value);
  });

  const moonPositionX = useDerivedValue(() => {
    return positionX.value + PLANET_RADIUS * 1.5 * Math.cos(moonAngle.value);
  });

  const moonPositionY = useDerivedValue(() => {
    return positionY.value + PLANET_RADIUS * 1.5 * Math.sin(moonAngle.value);
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <GestureHandlerRootView>
      <Canvas style={{ height, width }}>
        {/* Black Hole with Shadow */}
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={PLANET_RADIUS}
          color={colors.warning}
        >
          <Shadow
            dx={0}
            dy={0}
            blur={30}
            color={colors.warning}
            inner={false}
          />
        </Circle>

        {/* Orbit */}
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={ORBIT_RADIUS}
          color={colors.tint}
          style="stroke"
          strokeWidth={1}
        />
      </Canvas>
      {/* Planet */}
      <GestureDetector gesture={gesture}>
        <Canvas style={{ height, width, position: "absolute" }}>
          {/* Earth */}
          <Circle
            cx={positionX}
            cy={positionY}
            r={PLANET_RADIUS / 2}
            color={colors.accent1}
          />
          {/* Earth's Orbit */}
          <Circle
            cx={positionX}
            cy={positionY}
            r={PLANET_RADIUS * 1.5}
            style="stroke"
            strokeWidth={1}
            color={colors.warning}
          />

          {/*  */}
          <Circle
            cx={moonPositionX}
            cy={moonPositionY}
            r={PLANET_RADIUS / 6}
            color={colors.moonGray}
          />
        </Canvas>
      </GestureDetector>
      <Animated.View style={[styles.infoContainer, animatedStyle]}>
        <Text style={styles.text}>{"You can move the blue planet !!"}</Text>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

export default Planet;

const themedStyleSheet = (colors: typeof Colors.dark) =>
  StyleSheet.create({
    infoContainer: {
      position: "absolute",
      top: 20,
      left: 20,
      alignSelf: "center",
      justifyContent: "center",
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.tint,
      padding: 10,
    },
    text: {
      color: colors.tint,
    },
  });

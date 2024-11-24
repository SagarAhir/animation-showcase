import Colors from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";
import { Canvas, Circle, Oval, Shadow } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
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
  interpolateColor,
  interpolate,
} from "react-native-reanimated";
import Stars from "./Stars";
import { CustomText } from "./StyledText";

const { height, width } = Dimensions.get("window");

const ORBIT_RADIUS_X = 250;
const ORBIT_RADIUS_Y = 300;
const STAR_RADIUS = 30;
const PLANET_RADIUS = STAR_RADIUS / 4;
const MOON_ORBIT = PLANET_RADIUS * 4;
const MOON_RADIUS = PLANET_RADIUS / 2;
const EARTH_YEAR = 11000;
const MOON_YEAR = 3000;

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
        duration: EARTH_YEAR,
        easing: Easing.linear,
      }),
      -1
    );
    moonAngle.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: MOON_YEAR,
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
      const dx = e.absoluteX - width / 2; // x - center x
      const dy = e.absoluteY - height / 2; // y - center y
      angle.value = Math.atan2(dy, dx);
    })
    .onEnd(() => {
      const currentAngle = angle.value % (Math.PI * 2);
      const remainingAngle =
        currentAngle <= 0
          ? Math.PI * 2 + currentAngle
          : Math.PI * 2 - currentAngle;
      const normalizedDuration = (remainingAngle / (Math.PI * 2)) * EARTH_YEAR;

      angle.value = withTiming(
        angle.value + remainingAngle,
        {
          duration: normalizedDuration,
          easing: Easing.linear,
        },
        () => {
          angle.value = withRepeat(
            withTiming(angle.value + Math.PI * 2, {
              duration: EARTH_YEAR,
              easing: Easing.linear,
            }),
            -1
          );
        }
      );
    });

  const positionX = useDerivedValue(() => {
    return width / 2 + (ORBIT_RADIUS_X / 2) * Math.cos(angle.value);
  });

  const positionY = useDerivedValue(() => {
    return height / 2 + (ORBIT_RADIUS_Y / 2) * Math.sin(angle.value);
  });

  const moonPositionX = useDerivedValue(() => {
    return positionX.value + MOON_ORBIT * Math.cos(moonAngle.value);
  });

  const moonPositionY = useDerivedValue(() => {
    return positionY.value + MOON_ORBIT * Math.sin(moonAngle.value);
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const planetColor = useDerivedValue(() => {
    const normalizedAngle =
      angle.value < 0 ? angle.value + 2 * Math.PI : angle.value;

    return interpolateColor(
      normalizedAngle,
      [
        0, // right
        Math.PI / 2, // top
        Math.PI, // left
        (3 * Math.PI) / 2, // bottom
        2 * Math.PI, // right
      ],
      [
        colors.error, // right
        colors.accent1, // top
        colors.error, // left
        colors.accent1, // bottom
        colors.error, // right
      ]
    );
  });

  const earthShadow = useDerivedValue(() => {
    const normalizedAngle =
      angle.value < 0 ? angle.value + 2 * Math.PI : angle.value;
    return interpolate(
      normalizedAngle,
      [
        0, // right
        Math.PI / 2, // top
        Math.PI, // left
        (3 * Math.PI) / 2, // bottom
        2 * Math.PI, // right
      ],
      [5, 0, 5, 0, 5]
    );
  });

  return (
    <GestureHandlerRootView>
      <Canvas style={{ height, width }}>
        {/* Black Hole with Shadow */}
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={STAR_RADIUS}
          color={colors.warning}
        >
          <Shadow
            dx={0}
            dy={0}
            blur={25}
            color={colors.warning}
            inner={false}
          />
        </Circle>

        {/* Orbit */}
        <Oval
          x={width / 2 - ORBIT_RADIUS_X / 2}
          y={height / 2 - ORBIT_RADIUS_Y / 2}
          width={ORBIT_RADIUS_X}
          height={ORBIT_RADIUS_Y}
          color={colors.border}
          style={"stroke"}
          strokeWidth={1}
        />
        {/* Stars */}
        {/* <Stars /> */}
      </Canvas>
      {/* Planet */}
      <GestureDetector gesture={gesture}>
        <Canvas style={{ height, width, position: "absolute" }}>
          {/* Earth with interpolated color */}
          <Circle
            cx={positionX}
            cy={positionY}
            r={PLANET_RADIUS}
            color={planetColor}
          >
            <Shadow dx={0} dy={0} blur={earthShadow} color={colors.warning} />
          </Circle>
          {/* Earth's Orbit */}
          <Circle
            cx={positionX}
            cy={positionY}
            r={MOON_ORBIT}
            style="stroke"
            strokeWidth={1}
            color={colors.border}
          />

          {/* Moon  */}
          <Circle
            cx={moonPositionX}
            cy={moonPositionY}
            r={MOON_RADIUS}
            color={colors.moonGray}
          />
        </Canvas>
      </GestureDetector>
      <Animated.View style={[styles.infoContainer, animatedStyle]}>
        <CustomText style={styles.text}>
          {"You can move the blue planet !!"}
        </CustomText>
      </Animated.View>
    </GestureHandlerRootView>
  );
};

export default Planet;

const themedStyleSheet = (colors: typeof Colors.dark) =>
  StyleSheet.create({
    infoContainer: {
      position: "absolute",
      top: "5%",
      left: "10%",
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
    stars: {
      position: "absolute",
      top: 0,
      left: 0,
    },
  });

import { Pressable, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import {
  Canvas,
  Circle,
  Group,
  vec,
  Text as SkiaText,
  useFont,
  Blur,
} from "@shopify/react-native-skia";
import { useTheme } from "@/context/ThemeContext";
import { Text } from "./Themed";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  SharedValue,
  runOnJS,
  interpolateColor,
  DerivedValue,
  interpolate,
} from "react-native-reanimated";

interface DotType {
  startX: number;
  startY: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

// Radius of the main circle
const CIRCLE_STROKE_WIDTH = 3; // Stroke width of the circle
const DOT_COUNT = 50; // Number of dots around the circle
const DOT_RADIUS = 1.5; // Size of each dot
const CHARGING_DURATION = 20000; // Time in milliseconds to reach 100

const Charging = ({ diameter }: { diameter: number }) => {
  const { colors } = useTheme();
  const [startAnimation, setStartAnimation] = React.useState(false);
  const percentage = useSharedValue(0);

  const CIRCLE_RADIUS = diameter / 2 - CIRCLE_STROKE_WIDTH - 20; // radius - stroke-width - blur width

  const dots = React.useRef(
    Array.from({ length: DOT_COUNT }, (_, index) => {
      const angle = (2 * Math.PI * index) / DOT_COUNT;
      const startX = diameter / 2 + CIRCLE_RADIUS * Math.cos(angle);
      const startY = diameter / 2 + CIRCLE_RADIUS * Math.sin(angle);

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

  const onPressStart = () => {
    setStartAnimation(!startAnimation);
    if (startAnimation) {
      percentage.value = withTiming(0, { duration: 300 });
    } else {
      percentage.value = 0;
      percentage.value = withTiming(
        100,
        { duration: CHARGING_DURATION, easing: Easing.linear },
        (finished) => {
          if (finished) {
            runOnJS(setStartAnimation)(false);
          }
        }
      );
    }
  };

  const derivedColor = useDerivedValue(() => {
    return interpolateColor(
      percentage.value,
      [0, 100],
      [colors.error, colors.success]
    );
  });

  const circleBlur = useDerivedValue(() => {
    return interpolate(percentage.value, [0, 100], [0, 10]);
  });

  return (
    <View style={styles.container}>
      <Canvas style={{ height: diameter, width: diameter }}>
        <Circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={CIRCLE_RADIUS}
          color={derivedColor}
          style="stroke"
          strokeWidth={circleBlur}
        >
          <Blur blur={circleBlur} />
        </Circle>
        <Circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={CIRCLE_RADIUS}
          style="stroke"
          strokeWidth={CIRCLE_STROKE_WIDTH}
          color={derivedColor}
        />

        <Group>
          {dots.map((dot, index) => (
            <AnimatedDot
              key={index}
              dot={dot}
              startAnimation={startAnimation}
              color={derivedColor}
              diameter={diameter}
            />
          ))}
        </Group>

        <AnimatedPercentageText
          percentage={percentage}
          startAnimation={startAnimation}
          diameter={diameter}
        />
      </Canvas>
      <Pressable
        style={[styles.button, { backgroundColor: colors.gray100 }]}
        onPress={onPressStart}
      >
        <Text>{startAnimation ? "Stop" : "Start"}</Text>
      </Pressable>
    </View>
  );
};

const AnimatedPercentageText = React.memo(
  ({
    startAnimation,
    percentage,
    diameter,
  }: {
    startAnimation: boolean;
    percentage: SharedValue<number>;
    diameter: number;
  }) => {
    const { colors } = useTheme();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const font = useFont(require("../assets/fonts/Quicksand-Regular.ttf"), 30);

    useEffect(() => {
      if (startAnimation) {
        scale.value = withRepeat(
          withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
        opacity.value = withRepeat(
          withTiming(0.5, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      } else {
        cancelAnimation(scale);
        cancelAnimation(opacity);
        scale.value = withTiming(1, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });
      }
    }, [startAnimation]);

    const derivedScale = useDerivedValue(() => scale.value);
    const derivedOpacity = useDerivedValue(() => opacity.value);
    const text = useDerivedValue(() => `${Math.round(percentage.value)}%`);
    const derivedColor = useDerivedValue(() =>
      interpolateColor(
        percentage.value,
        [0, 100],
        [colors.error, colors.success]
      )
    );

    const textWidth = useDerivedValue(
      () => font?.measureText(text.value).width ?? 0
    );
    const x = useDerivedValue(() => (diameter - textWidth.value) / 2);
    const y = diameter / 2 + (font?.getSize() ?? 1) / 3;

    return (
      <SkiaText
        x={x}
        y={y}
        text={text}
        font={font}
        color={derivedColor}
        opacity={derivedOpacity}
        transform={[{ scale: derivedScale.value }]}
        origin={vec(diameter / 2, diameter / 2)}
      />
    );
  }
);

const AnimatedDot = React.memo(
  ({
    dot,
    startAnimation,
    color,
    diameter,
  }: {
    dot: DotType;
    startAnimation: boolean;
    color: DerivedValue<string>;
    diameter: number;
  }) => {
    const x = useSharedValue(dot.x);
    const y = useSharedValue(dot.y);
    const opacity = useSharedValue(dot.opacity);
    const scale = useSharedValue(dot.scale);

    const duration = Math.random() * 5000 + 1000; // Random duration between 1000ms and 6000ms
    if (startAnimation) {
      const easing = Easing.exp;
      x.value = withRepeat(withTiming(diameter / 2, { duration, easing }), -1);
      y.value = withRepeat(withTiming(diameter / 2, { duration, easing }), -1);
      opacity.value = withRepeat(withTiming(0, { duration, easing }), -1);
      scale.value = withRepeat(withTiming(0, { duration, easing }), -1);
    } else {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(opacity);

      x.value = withTiming(dot.startX, { duration: 300 });
      y.value = withTiming(dot.startY, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }

    const derivedX = useDerivedValue(() => x.value);
    const derivedY = useDerivedValue(() => y.value);
    const derivedOpacity = useDerivedValue(() => opacity.value);
    const derivedScale = useDerivedValue(() => scale.value);

    return (
      <Circle
        cx={derivedX}
        cy={derivedY}
        r={DOT_RADIUS}
        color={color}
        opacity={derivedOpacity}
        transform={[{ scale: derivedScale.value }]}
        origin={vec(dot.startX, dot.startY)}
      />
    );
  }
);

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

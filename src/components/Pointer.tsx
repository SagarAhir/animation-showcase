import React from "react";
import { Dimensions, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withClamp,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Canvas, Circle, BlurMask } from "@shopify/react-native-skia";
import Colors from "@/constants/Colors";

const {  width } = Dimensions.get("window");

const Pointer = ({
  x,
  y,
  size,
  color = Colors.light.primary,
  shadowCount = 2,
  delay = 15,
}: {
  x: number;
  y: number;
  size: number;
  color?: string;
  shadowCount?: number;
  delay?: number;
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const translateX = useSharedValue(x);
  const translateY = useSharedValue(y);
  const prevTranslateX = useSharedValue(0);
  const prevTranslateY = useSharedValue(0);

  const maxTranslateX = width - size - 40;
  const maxTranslateY = 500 - size;

  const gesture = Gesture.Pan()
    .onBegin(() => {
      prevTranslateX.value = translateX.value;
      prevTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = withClamp(
        { min: 0, max: maxTranslateX },
        withSpring(prevTranslateX.value + e.translationX)
      );
      translateY.value = withClamp(
        { min: 0, max: maxTranslateY },
        withSpring(prevTranslateY.value + e.translationY)
      );
    })
    .onFinalize(() => {
      translateX.value = withClamp(
        { min: 0, max: maxTranslateX },
        withSpring(x)
      );
      translateY.value = withClamp(
        { min: 0, max: maxTranslateY },
        withSpring(y)
      );
    });

  const rStyleMain = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const ShadowComp = ({ index }: { index: number }) => {
    const sIndex = index + 1;
    const sShadowSize = size * (1 / (sIndex));
    const shadowAnimation = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: withTiming(translateX.value, {
            duration: sIndex * delay,
          }),
        },
        {
          translateY: withTiming(translateY.value, {
            duration: sIndex * delay,
          }),
        },
      ],
    }));
    return (
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            left: -sShadowSize * 0.5,
            top: -sShadowSize * 0.5,
          },
          shadowAnimation,
        ]}
      >
        <Canvas style={{ width: size * 3, height: size * 2 }}>
          <Circle
            cx={sShadowSize}
            cy={sShadowSize}
            r={sShadowSize / 2}
            color={isDark ? Colors.dark.primary : Colors.light.primary}
            opacity={1}
          >
            <BlurMask blur={5} style="normal" />
          </Circle>
        </Canvas>
      </Animated.View>
    );
  };

  const renderShadows = () => {
    const shadows = Array.from({ length: shadowCount }, (_, index) => index);
    return (
      <Animated.View>
        {shadows.map((_, index) => {
          return <ShadowComp key={`Shadow-${index}`} index={index} />;
        })}
      </Animated.View>
    );
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={{
          width: width - 40,
          height: 500,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderRadius: 10,
          margin: 20,
          borderWidth: 1,
          borderColor: isDark ? Colors.dark.text : Colors.light.text,
        }}
      >
        {renderShadows()}
        <Animated.View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              position: "absolute",
            },
            rStyleMain,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default Pointer;

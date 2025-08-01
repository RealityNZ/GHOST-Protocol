import React, { useEffect } from 'react';
import { ReactNode } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';

interface LogEntryAnimatedProps {
  children: ReactNode;
  delay?: number;
  glitchColor?: string;
}

export default function LogEntryAnimated({ 
  children, 
  delay = 0, 
  glitchColor = '#00FFF7' 
}: LogEntryAnimatedProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const glitchOffset = useSharedValue(0);

  useEffect(() => {
    // Entry animation
    opacity.value = withDelay(
      delay,
      withTiming(1, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      })
    );

    translateY.value = withDelay(
      delay,
      withTiming(0, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      })
    );

    // Glitch effect
    const glitchDelay = delay + 800;
    setTimeout(() => {
      glitchOffset.value = withSequence(
        withTiming(2, { duration: 50 }),
        withTiming(0, { duration: 50 }),
        withTiming(-1, { duration: 30 }),
        withTiming(0, { duration: 70 })
      );
    }, glitchDelay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: glitchOffset.value }
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
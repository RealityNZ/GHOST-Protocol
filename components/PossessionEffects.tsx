import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface PossessionEffectsProps {
  isActive: boolean;
  isGenerating: boolean;
}

export default function PossessionEffects({ isActive, isGenerating }: PossessionEffectsProps) {
  const chromaticOffset = useSharedValue(0);
  const borderGlow = useSharedValue(0);
  const scanlineIntensity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Chromatic aberration
      chromaticOffset.value = withRepeat(
        withSequence(
          withTiming(2, { duration: 200 }),
          withTiming(0, { duration: 300 }),
          withTiming(-1, { duration: 150 }),
          withTiming(0, { duration: 250 })
        ),
        -1,
        false
      );

      // Border glow pulse
      borderGlow.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        true
      );

      // Scanline intensity
      scanlineIntensity.value = withTiming(0.3, { duration: 500 });
    } else {
      chromaticOffset.value = withTiming(0, { duration: 300 });
      borderGlow.value = withTiming(0, { duration: 300 });
      scanlineIntensity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  useEffect(() => {
    if (isGenerating) {
      // Intense effects during generation
      chromaticOffset.value = withRepeat(
        withTiming(3, { duration: 100 }),
        -1,
        true
      );
    }
  }, [isGenerating]);

  const chromaticStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chromaticOffset.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    shadowOpacity: borderGlow.value * 0.8,
    shadowRadius: borderGlow.value * 20,
  }));

  const scanlineStyle = useAnimatedStyle(() => ({
    opacity: scanlineIntensity.value,
  }));

  if (!isActive) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Chromatic Aberration Layers */}
      <Animated.View style={[styles.chromaticLayer, styles.redLayer, chromaticStyle]} />
      <Animated.View style={[styles.chromaticLayer, styles.blueLayer, chromaticStyle]} />

      {/* Border Glow */}
      <Animated.View style={[styles.borderGlow, borderStyle]} />

      {/* Possession Scanlines */}
      <Animated.View style={[styles.scanlineContainer, scanlineStyle]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.possessionScanline,
              {
                top: (i * height) / 10,
                opacity: Math.random() * 0.5 + 0.2,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Neural Activity Indicators */}
      <View style={styles.neuralIndicators}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.neuralDot,
              {
                top: Math.random() * height * 0.8 + height * 0.1,
                left: Math.random() * width * 0.8 + width * 0.1,
                backgroundColor: '#FF2EC0',
                opacity: 0.6,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  chromaticLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    mixBlendMode: 'screen',
  },
  redLayer: {
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
  },
  blueLayer: {
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
  },
  borderGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderWidth: 2,
    borderColor: '#FF2EC0',
    borderRadius: 20,
    shadowColor: '#FF2EC0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
  },
  scanlineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  possessionScanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00FFF7',
  },
  neuralIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  neuralDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
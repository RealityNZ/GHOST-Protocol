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

interface BackgroundEffectsProps {
  variant?: 'surveillance' | 'neural' | 'system' | 'default';
  intensity?: 'subtle' | 'medium' | 'intense';
}

export default function BackgroundEffects({ 
  variant = 'default', 
  intensity = 'subtle' 
}: BackgroundEffectsProps) {
  const scanlinePosition = useSharedValue(0);
  const glitchOffset = useSharedValue(0);
  const staticOpacity = useSharedValue(0.02);

  useEffect(() => {
    // Scanline animation
    const scanlineDuration = intensity === 'intense' ? 3000 : intensity === 'medium' ? 4000 : 6000;
    scanlinePosition.value = withRepeat(
      withTiming(height + 100, { 
        duration: scanlineDuration, 
        easing: Easing.linear 
      }),
      -1,
      false
    );

    // Glitch effect
    glitchOffset.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 8000 }),
        withTiming(2, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withTiming(-1, { duration: 50 }),
        withTiming(0, { duration: 50 })
      ),
      -1,
      false
    );

    // Static intensity
    const staticIntensity = intensity === 'intense' ? 0.05 : intensity === 'medium' ? 0.03 : 0.02;
    staticOpacity.value = withRepeat(
      withTiming(staticIntensity, { duration: 2000 }),
      -1,
      true
    );
  }, [intensity]);

  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlinePosition.value }],
  }));

  const glitchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: glitchOffset.value }],
  }));

  const staticStyle = useAnimatedStyle(() => ({
    opacity: staticOpacity.value,
  }));

  const getColors = () => {
    switch (variant) {
      case 'surveillance':
        return ['#00FFF7', '#FF2EC0'];
      case 'neural':
        return ['#FF2EC0', '#FFB000'];
      case 'system':
        return ['#FFB000', '#FF0080'];
      default:
        return ['#00FFF7', '#1E1E1E'];
    }
  };

  const [primaryColor, secondaryColor] = getColors();

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Grid Pattern */}
      <Animated.View style={[styles.gridContainer, glitchStyle]}>
        <View style={styles.grid}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={`horizontal-${i}`}
              style={[
                styles.gridLine,
                styles.horizontal,
                {
                  top: (i * height) / 20,
                  backgroundColor: primaryColor,
                  opacity: 0.03,
                }
              ]}
            />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <View
              key={`vertical-${i}`}
              style={[
                styles.gridLine,
                styles.vertical,
                {
                  left: (i * width) / 15,
                  backgroundColor: primaryColor,
                  opacity: 0.03,
                }
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Floating Elements */}
      <View style={styles.floatingElements}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`floating-${i}`}
            style={[
              styles.floatingDot,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
                opacity: 0.1,
              }
            ]}
          />
        ))}
      </View>

      {/* VHS Scanline */}
      <Animated.View style={[styles.scanline, scanlineStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            `${primaryColor}40`,
            `${primaryColor}80`,
            `${primaryColor}40`,
            'transparent'
          ]}
          style={styles.scanlineGradient}
        />
      </Animated.View>

      {/* Static Interference */}
      <Animated.View style={[styles.staticContainer, staticStyle]}>
        {Array.from({ length: 50 }).map((_, i) => (
          <View
            key={`static-${i}`}
            style={[
              styles.staticDot,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                backgroundColor: Math.random() > 0.5 ? primaryColor : secondaryColor,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Vignette */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(12, 12, 12, 0.1)',
          'rgba(12, 12, 12, 0.3)'
        ]}
        style={styles.vignette}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />
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
    zIndex: -1,
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  grid: {
    flex: 1,
  },
  gridLine: {
    position: 'absolute',
  },
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    height: '100%',
    width: 1,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    top: -100,
  },
  scanlineGradient: {
    flex: 1,
  },
  staticContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  staticDot: {
    position: 'absolute',
    width: 1,
    height: 1,
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
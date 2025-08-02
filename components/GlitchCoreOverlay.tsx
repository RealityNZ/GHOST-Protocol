import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface GlitchCoreOverlayProps {
  isActive: boolean;
}

export default function GlitchCoreOverlay({ isActive }: GlitchCoreOverlayProps) {
  // Main glitch animations
  const glitchX = useSharedValue(0);
  const glitchY = useSharedValue(0);
  const glitchScale = useSharedValue(1);
  const glitchRotation = useSharedValue(0);
  const glitchOpacity = useSharedValue(0);
  
  // RGB separation
  const redOffset = useSharedValue(0);
  const greenOffset = useSharedValue(0);
  const blueOffset = useSharedValue(0);
  
  // Screen corruption
  const corruptionOpacity = useSharedValue(0);
  const scanlinePosition = useSharedValue(-100);
  const staticIntensity = useSharedValue(0);
  
  // Digital noise
  const noiseOpacity = useSharedValue(0);
  const pixelationScale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      // Main glitch overlay
      glitchOpacity.value = withTiming(1, { duration: 200 });
      
      // Intense horizontal displacement
      glitchX.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 30 }),
          withTiming(25, { duration: 20 }),
          withTiming(-35, { duration: 15 }),
          withTiming(18, { duration: 25 }),
          withTiming(-28, { duration: 20 }),
          withTiming(12, { duration: 30 }),
          withTiming(-15, { duration: 25 }),
          withTiming(0, { duration: 35 })
        ),
        -1,
        false
      );

      // Minimal vertical jitter
      glitchY.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 200 }),
          withTiming(1, { duration: 15 }),
          withTiming(-2, { duration: 10 }),
          withTiming(1, { duration: 20 }),
          withTiming(0, { duration: 55 })
        ),
        -1,
        false
      );

      // Scale distortion
      glitchScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1.02, { duration: 50 }),
          withTiming(0.98, { duration: 30 }),
          withTiming(1.01, { duration: 40 }),
          withTiming(1, { duration: 80 })
        ),
        -1,
        false
      );

      // Rotation glitch
      glitchRotation.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 300 }),
          withTiming(0.5, { duration: 20 }),
          withTiming(-0.8, { duration: 15 }),
          withTiming(0.3, { duration: 25 }),
          withTiming(0, { duration: 40 })
        ),
        -1,
        false
      );

      // RGB chromatic aberration
      redOffset.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 40 }),
          withTiming(15, { duration: 20 }),
          withTiming(-12, { duration: 15 }),
          withTiming(8, { duration: 25 }),
          withTiming(-6, { duration: 20 }),
          withTiming(0, { duration: 30 })
        ),
        -1,
        false
      );

      greenOffset.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 50 }),
          withTiming(-18, { duration: 15 }),
          withTiming(22, { duration: 12 }),
          withTiming(-10, { duration: 18 }),
          withTiming(14, { duration: 15 }),
          withTiming(0, { duration: 25 })
        ),
        -1,
        false
      );

      blueOffset.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 35 }),
          withTiming(12, { duration: 18 }),
          withTiming(-20, { duration: 12 }),
          withTiming(7, { duration: 22 }),
          withTiming(-11, { duration: 18 }),
          withTiming(0, { duration: 30 })
        ),
        -1,
        false
      );

      // Screen corruption
      corruptionOpacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 150 }),
          withTiming(0.8, { duration: 50 }),
          withTiming(0.3, { duration: 100 }),
          withTiming(0.9, { duration: 30 }),
          withTiming(0, { duration: 170 })
        ),
        -1,
        false
      );

      // Scanlines
      scanlinePosition.value = withRepeat(
        withTiming(height + 100, { 
          duration: 600, 
          easing: Easing.linear 
        }),
        -1,
        false
      );

      // Static noise
      staticIntensity.value = withRepeat(
        withTiming(0.8, { duration: 80 }),
        -1,
        true
      );

      // Digital noise
      noiseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 40 }),
          withTiming(0.9, { duration: 25 }),
          withTiming(0.3, { duration: 50 }),
          withTiming(1.0, { duration: 20 }),
          withTiming(0.2, { duration: 60 })
        ),
        -1,
        false
      );

      // Pixelation effect
      pixelationScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(0.92, { duration: 30 }),
          withTiming(1.08, { duration: 20 }),
          withTiming(0.96, { duration: 40 }),
          withTiming(1.03, { duration: 25 }),
          withTiming(1, { duration: 35 })
        ),
        -1,
        false
      );

    } else {
      // Fade out all effects
      glitchOpacity.value = withTiming(0, { duration: 300 });
      glitchX.value = withTiming(0, { duration: 300 });
      glitchY.value = withTiming(0, { duration: 300 });
      glitchScale.value = withTiming(1, { duration: 300 });
      glitchRotation.value = withTiming(0, { duration: 300 });
      redOffset.value = withTiming(0, { duration: 300 });
      greenOffset.value = withTiming(0, { duration: 300 });
      blueOffset.value = withTiming(0, { duration: 300 });
      corruptionOpacity.value = withTiming(0, { duration: 300 });
      staticIntensity.value = withTiming(0, { duration: 300 });
      noiseOpacity.value = withTiming(0, { duration: 300 });
      pixelationScale.value = withTiming(1, { duration: 300 });
    }
  }, [isActive]);

  const mainGlitchStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: glitchX.value },
      { translateY: glitchY.value },
      { scale: glitchScale.value * pixelationScale.value },
      { rotate: `${glitchRotation.value}deg` }
    ],
    opacity: glitchOpacity.value,
  }));

  const redChannelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: redOffset.value }],
    opacity: glitchOpacity.value * 0.8,
  }));

  const greenChannelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: greenOffset.value }],
    opacity: glitchOpacity.value * 0.7,
  }));

  const blueChannelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: blueOffset.value }],
    opacity: glitchOpacity.value * 0.9,
  }));

  const corruptionStyle = useAnimatedStyle(() => ({
    opacity: corruptionOpacity.value,
  }));

  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlinePosition.value }],
    opacity: glitchOpacity.value,
  }));

  const staticStyle = useAnimatedStyle(() => ({
    opacity: staticIntensity.value * glitchOpacity.value,
  }));

  const noiseStyle = useAnimatedStyle(() => ({
    opacity: noiseOpacity.value * glitchOpacity.value,
  }));

  if (!isActive && glitchOpacity.value === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Main Glitch Container */}
      <Animated.View style={[styles.glitchContainer, mainGlitchStyle]}>
        
        {/* RGB Channel Separation */}
        <Animated.View style={[styles.colorChannel, styles.redChannel, redChannelStyle]} />
        <Animated.View style={[styles.colorChannel, styles.greenChannel, greenChannelStyle]} />
        <Animated.View style={[styles.colorChannel, styles.blueChannel, blueChannelStyle]} />

        {/* Screen Corruption Blocks */}
        <Animated.View style={[styles.corruptionContainer, corruptionStyle]}>
          {Array.from({ length: 15 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.corruptionBlock,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  width: Math.random() * 200 + 50,
                  height: Math.random() * 20 + 5,
                  backgroundColor: Math.random() > 0.5 ? '#FF2EC0' : '#00FFF7',
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Intense Scanlines */}
        <Animated.View style={[styles.scanlineContainer, scanlineStyle]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <LinearGradient
              key={i}
              colors={[
                'transparent',
                '#FF2EC0AA',
                '#00FFF7FF',
                '#FF2EC0AA',
                'transparent'
              ]}
              style={[
                styles.scanline,
                {
                  top: (i * height) / 8 + Math.random() * 50,
                  height: Math.random() * 8 + 2,
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Digital Static */}
        <Animated.View style={[styles.staticContainer, staticStyle]}>
          {Array.from({ length: 200 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.staticPixel,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  backgroundColor: Math.random() > 0.5 ? '#FFFFFF' : '#000000',
                  opacity: Math.random(),
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Digital Noise */}
        <Animated.View style={[styles.noiseContainer, noiseStyle]}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.noiseBlock,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  width: Math.random() * width * 0.6 + width * 0.3,
                  height: Math.random() * 25 + 5,
                  transform: [
                    { skewX: `${Math.random() * 15 - 7.5}deg` },
                  ],
                }
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 46, 192, 0.4)',
                  'rgba(0, 255, 247, 0.1)',
                ]}
                style={styles.noiseGradient}
              />
            </View>
          ))}
        </Animated.View>

        {/* Datamosh Effect */}
        <View style={styles.datamoshContainer}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.datamoshBlock,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  width: Math.random() * 100 + 20,
                  height: Math.random() * 30 + 5,
                  backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`,
                  transform: [
                    { skewX: `${Math.random() * 10 - 5}deg` },
                    { skewY: `${Math.random() * 5 - 2.5}deg` }
                  ]
                }
              ]}
            />
          ))}
        </View>

        {/* VHS Tracking Error */}
        <View style={styles.vhsContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <LinearGradient
              key={i}
              colors={['#FF2EC0', '#00FFF7', '#FF2EC0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.vhsLine,
                {
                  top: Math.random() * height,
                  height: Math.random() * 15 + 3,
                  opacity: Math.random() * 0.8 + 0.2,
                }
              ]}
            />
          ))}
        </View>

        {/* Screen Tearing */}
        <View style={styles.tearContainer}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.screenTear,
                {
                  top: Math.random() * height,
                  left: Math.random() * width * 0.8,
                  width: Math.random() * width * 0.4 + width * 0.2,
                  height: Math.random() * 40 + 10,
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  borderTopColor: '#FF2EC0',
                  borderBottomColor: '#00FFF7',
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                }
              ]}
            />
          ))}
        </View>

      </Animated.View>

      {/* Full Screen Flash */}
      <Animated.View style={[styles.flashOverlay, corruptionStyle]}>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.9)',
            'rgba(255, 46, 192, 0.7)',
            'rgba(0, 255, 247, 0.8)',
            'rgba(255, 255, 255, 0.6)'
          ]}
          style={styles.flashGradient}
        />
      </Animated.View>
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
    zIndex: 9999,
  },
  glitchContainer: {
    flex: 1,
  },
  colorChannel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    mixBlendMode: 'screen',
  },
  redChannel: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  greenChannel: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  blueChannel: {
    backgroundColor: 'rgba(0, 0, 255, 0.4)',
  },
  corruptionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corruptionBlock: {
    position: 'absolute',
    opacity: 0.8,
  },
  scanlineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  staticContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  staticPixel: {
    position: 'absolute',
    width: 2,
    height: 2,
  },
  noiseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noiseBlock: {
    position: 'absolute',
  },
  noiseGradient: {
    flex: 1,
  },
  datamoshContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datamoshBlock: {
    position: 'absolute',
  },
  vhsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  vhsLine: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  tearContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  screenTear: {
    position: 'absolute',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flashGradient: {
    flex: 1,
  },
});
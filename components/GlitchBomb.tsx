import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, PanGestureHandler, State } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  runOnJS,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface GlitchBombProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export default function GlitchBomb({ isActive, onDeactivate }: GlitchBombProps) {
  const [tapCount, setTapCount] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  
  // Animation values
  const chromaticR = useSharedValue(0);
  const chromaticG = useSharedValue(0);
  const chromaticB = useSharedValue(0);
  const pixelShift = useSharedValue(0);
  const scanlinePosition = useSharedValue(0);
  const noiseOpacity = useSharedValue(0);
  const distortionScale = useSharedValue(1);
  const colorInvert = useSharedValue(0);
  const blockGlitch = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Reset counters
      setTapCount(0);
      setSwipeCount(0);
      
      // Start intense glitch animations
      chromaticR.value = withRepeat(
        withSequence(
          withTiming(8, { duration: 100 }),
          withTiming(-5, { duration: 80 }),
          withTiming(12, { duration: 60 }),
          withTiming(0, { duration: 120 })
        ),
        -1,
        false
      );

      chromaticG.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 120 }),
          withTiming(10, { duration: 90 }),
          withTiming(-3, { duration: 70 }),
          withTiming(0, { duration: 100 })
        ),
        -1,
        false
      );

      chromaticB.value = withRepeat(
        withSequence(
          withTiming(4, { duration: 110 }),
          withTiming(-8, { duration: 85 }),
          withTiming(6, { duration: 95 }),
          withTiming(0, { duration: 90 })
        ),
        -1,
        false
      );

      pixelShift.value = withRepeat(
        withSequence(
          withTiming(15, { duration: 50 }),
          withTiming(-20, { duration: 40 }),
          withTiming(25, { duration: 30 }),
          withTiming(-10, { duration: 60 }),
          withTiming(0, { duration: 80 })
        ),
        -1,
        false
      );

      scanlinePosition.value = withRepeat(
        withTiming(height + 100, { duration: 800, easing: Easing.linear }),
        -1,
        false
      );

      noiseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 100 }),
          withTiming(0.3, { duration: 150 }),
          withTiming(0.9, { duration: 80 }),
          withTiming(0.1, { duration: 120 })
        ),
        -1,
        false
      );

      distortionScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 200 }),
          withTiming(0.95, { duration: 180 }),
          withTiming(1.08, { duration: 160 }),
          withTiming(1, { duration: 220 })
        ),
        -1,
        false
      );

      colorInvert.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 400 }),
          withTiming(0.7, { duration: 200 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      );

      blockGlitch.value = withRepeat(
        withSequence(
          withTiming(20, { duration: 150 }),
          withTiming(0, { duration: 200 }),
          withTiming(35, { duration: 100 }),
          withTiming(0, { duration: 250 })
        ),
        -1,
        false
      );

    } else {
      // Stop all animations
      chromaticR.value = withTiming(0, { duration: 500 });
      chromaticG.value = withTiming(0, { duration: 500 });
      chromaticB.value = withTiming(0, { duration: 500 });
      pixelShift.value = withTiming(0, { duration: 500 });
      noiseOpacity.value = withTiming(0, { duration: 500 });
      distortionScale.value = withTiming(1, { duration: 500 });
      colorInvert.value = withTiming(0, { duration: 500 });
      blockGlitch.value = withTiming(0, { duration: 500 });
    }
  }, [isActive]);

  // Handle top-left corner taps
  const handleTopLeftTap = () => {
    if (!isActive) return;
    
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 3) {
      onDeactivate();
    }
    
    // Reset tap count after 2 seconds
    setTimeout(() => {
      setTapCount(0);
    }, 2000);
  };

  // Handle diagonal swipes
  const diagonalSwipe = Gesture.Pan()
    .onEnd((event) => {
      if (!isActive) return;
      
      const { translationX, translationY } = event;
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      
      // Check if it's a diagonal swipe (both X and Y movement significant)
      if (distance > 100 && Math.abs(translationX) > 50 && Math.abs(translationY) > 50) {
        const newCount = swipeCount + 1;
        setSwipeCount(newCount);
        
        if (newCount >= 3) {
          onDeactivate();
        }
        
        // Reset swipe count after 3 seconds
        setTimeout(() => {
          setSwipeCount(0);
        }, 3000);
      }
    });

  // Animated styles
  const chromaticRedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chromaticR.value }],
  }));

  const chromaticGreenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chromaticG.value }],
  }));

  const chromaticBlueStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chromaticB.value }],
  }));

  const pixelShiftStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pixelShift.value },
      { scaleX: distortionScale.value },
      { scaleY: distortionScale.value }
    ],
  }));

  const scanlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanlinePosition.value }],
  }));

  const noiseStyle = useAnimatedStyle(() => ({
    opacity: noiseOpacity.value,
  }));

  const colorInvertStyle = useAnimatedStyle(() => ({
    opacity: colorInvert.value,
  }));

  const blockGlitchStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: blockGlitch.value }],
  }));

  if (!isActive) return null;

  return (
    <GestureDetector gesture={diagonalSwipe}>
      <View style={styles.container}>
        {/* Chromatic Aberration Layers */}
        <Animated.View style={[styles.chromaticLayer, styles.redLayer, chromaticRedStyle]} />
        <Animated.View style={[styles.chromaticLayer, styles.greenLayer, chromaticGreenStyle]} />
        <Animated.View style={[styles.chromaticLayer, styles.blueLayer, chromaticBlueStyle]} />

        {/* Pixel Shift Distortion */}
        <Animated.View style={[styles.pixelShiftLayer, pixelShiftStyle]}>
          <LinearGradient
            colors={['#FF2EC0', '#00FFF7', '#FFB000']}
            style={styles.pixelGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {/* Rapid Scanlines */}
        <Animated.View style={[styles.scanlineContainer, scanlineStyle]}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.scanline,
                {
                  top: i * 40,
                  backgroundColor: i % 3 === 0 ? '#FF2EC0' : i % 3 === 1 ? '#00FFF7' : '#FFB000',
                  opacity: 0.6 + Math.random() * 0.4,
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Digital Noise */}
        <Animated.View style={[styles.noiseContainer, noiseStyle]}>
          {Array.from({ length: 200 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.noiseDot,
                {
                  top: Math.random() * height,
                  left: Math.random() * width,
                  backgroundColor: Math.random() > 0.5 ? '#FFFFFF' : '#000000',
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Block Glitch Effect */}
        <Animated.View style={[styles.blockGlitchContainer, blockGlitchStyle]}>
          {Array.from({ length: 15 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.glitchBlock,
                {
                  top: Math.random() * height,
                  left: Math.random() * width * 0.8,
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 20 + 5,
                  backgroundColor: ['#FF2EC0', '#00FFF7', '#FFB000', '#FFFFFF'][Math.floor(Math.random() * 4)],
                  opacity: 0.7 + Math.random() * 0.3,
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Color Inversion Layer */}
        <Animated.View style={[styles.colorInvertLayer, colorInvertStyle]} />

        {/* Interference Bars */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`interference-${i}`}
            style={[
              styles.interferenceBar,
              {
                top: (i * height) / 8 + Math.random() * 50,
                left: Math.random() * width * 0.3,
                width: Math.random() * width * 0.7 + width * 0.3,
                backgroundColor: '#FFFFFF',
                opacity: 0.1 + Math.random() * 0.2,
              }
            ]}
          />
        ))}

        {/* Top-left corner tap zone */}
        <TouchableOpacity
          style={styles.emergencyTapZone}
          onPress={handleTopLeftTap}
          activeOpacity={1}
        >
          {/* Invisible tap zone */}
        </TouchableOpacity>

        {/* Emergency indicators (subtle hints) */}
        {tapCount > 0 && (
          <View style={styles.tapIndicator}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tapDot,
                  { backgroundColor: i < tapCount ? '#00FFF7' : '#333333' }
                ]}
              />
            ))}
          </View>
        )}

        {swipeCount > 0 && (
          <View style={styles.swipeIndicator}>
            {Array.from({ length: 3 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.swipeDot,
                  { backgroundColor: i < swipeCount ? '#FF2EC0' : '#333333' }
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </GestureDetector>
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  greenLayer: {
    backgroundColor: 'rgba(0, 255, 0, 0.25)',
  },
  blueLayer: {
    backgroundColor: 'rgba(0, 0, 255, 0.35)',
  },
  pixelShiftLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  pixelGradient: {
    flex: 1,
  },
  scanlineContainer: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: height + 200,
  },
  scanline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  noiseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noiseDot: {
    position: 'absolute',
  },
  blockGlitchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glitchBlock: {
    position: 'absolute',
  },
  colorInvertLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    mixBlendMode: 'difference',
  },
  interferenceBar: {
    position: 'absolute',
    height: 2,
  },
  emergencyTapZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    backgroundColor: 'transparent',
  },
  tapIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    gap: 6,
  },
  tapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    gap: 6,
  },
  swipeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
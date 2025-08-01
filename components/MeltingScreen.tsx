import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface MeltingScreenProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export default function MeltingScreen({ isActive, onDeactivate }: MeltingScreenProps) {
  const [tapCount, setTapCount] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);
  
  // Animation values for melting progression
  const meltProgress = useSharedValue(0);
  const warpIntensity = useSharedValue(0);
  const colorSwirl = useSharedValue(0);
  const verticalDrip = useSharedValue(0);
  const horizontalWave = useSharedValue(0);
  const psychedelicRotation = useSharedValue(0);
  const blackoutOpacity = useSharedValue(0);
  const glitchRecovery = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      setTapCount(0);
      setIsBlackout(false);
      
      // Progressive melting sequence
      // Phase 1: Initial warping (0-3s)
      meltProgress.value = withTiming(0.3, { 
        duration: 3000, 
        easing: Easing.out(Easing.cubic) 
      });
      
      warpIntensity.value = withTiming(1, { 
        duration: 3000, 
        easing: Easing.out(Easing.quad) 
      });

      // Phase 2: Color swirling (1-5s)
      colorSwirl.value = withDelay(1000, withTiming(1, { 
        duration: 4000, 
        easing: Easing.inOut(Easing.sine) 
      }));

      // Phase 3: Vertical dripping (2-6s)
      verticalDrip.value = withDelay(2000, withTiming(1, { 
        duration: 4000, 
        easing: Easing.in(Easing.cubic) 
      }));

      // Phase 4: Horizontal waves (3-7s)
      horizontalWave.value = withDelay(3000, withTiming(1, { 
        duration: 4000, 
        easing: Easing.ease 
      }));

      // Phase 5: Psychedelic chaos (4-8s)
      psychedelicRotation.value = withDelay(4000, withTiming(1, { 
        duration: 4000, 
        easing: Easing.ease 
      }));

      // Phase 6: Complete melt (5-10s)
      meltProgress.value = withDelay(5000, withTiming(1, { 
        duration: 5000, 
        easing: Easing.ease 
      }));

      // Phase 7: Blackout (10s)
      setTimeout(() => {
        blackoutOpacity.value = withTiming(1, { 
          duration: 2000, 
          easing: Easing.in(Easing.cubic) 
        });
        runOnJS(setIsBlackout)(true);
      }, 10000);

    } else {
      // Instant recovery with glitch
      glitchRecovery.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 50 }),
        withTiming(0.7, { duration: 30 }),
        withTiming(0, { duration: 70 })
      );

      // Reset all values
      meltProgress.value = withTiming(0, { duration: 300 });
      warpIntensity.value = withTiming(0, { duration: 300 });
      colorSwirl.value = withTiming(0, { duration: 300 });
      verticalDrip.value = withTiming(0, { duration: 300 });
      horizontalWave.value = withTiming(0, { duration: 300 });
      psychedelicRotation.value = withTiming(0, { duration: 300 });
      blackoutOpacity.value = withTiming(0, { duration: 300 });
      
      setIsBlackout(false);
    }
  }, [isActive]);

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

  // Melting distortion styles
  const meltingStyle = useAnimatedStyle(() => {
    const progress = meltProgress.value;
    const warp = warpIntensity.value;
    
    return {
      transform: [
        { 
          scaleY: interpolate(progress, [0, 1], [1, 0.1], Easing.in(Easing.expo))
        },
        { 
          translateY: interpolate(progress, [0, 1], [0, height * 0.8], Easing.in(Easing.cubic))
        },
        { 
          skewX: `${interpolate(warp, [0, 1], [0, 15])}deg` 
        },
        { 
          skewY: `${interpolate(warp, [0, 1], [0, 8])}deg` 
        }
      ],
    };
  });

  // Color swirl overlay
  const colorSwirlStyle = useAnimatedStyle(() => {
    const swirl = colorSwirl.value;
    
    return {
      opacity: interpolate(swirl, [0, 1], [0, 0.8]),
      transform: [
        { 
          rotate: `${interpolate(swirl, [0, 1], [0, 720])}deg` 
        },
        { 
          scale: interpolate(swirl, [0, 1], [1, 3]) 
        }
      ],
    };
  });

  // Vertical drip effect
  const verticalDripStyle = useAnimatedStyle(() => {
    const drip = verticalDrip.value;
    
    return {
      transform: [
        { 
          scaleY: interpolate(drip, [0, 1], [1, 4]) 
        },
        { 
          translateY: interpolate(drip, [0, 1], [0, height * 0.5]) 
        }
      ],
      opacity: interpolate(drip, [0, 1], [0, 0.6]),
    };
  });

  // Horizontal wave distortion
  const horizontalWaveStyle = useAnimatedStyle(() => {
    const wave = horizontalWave.value;
    
    return {
      transform: [
        { 
          scaleX: interpolate(wave, [0, 1], [1, 0.3]) 
        },
        { 
          translateX: interpolate(wave, [0, 1], [0, width * 0.3]) 
        },
        { 
          skewX: `${interpolate(wave, [0, 1], [0, 45])}deg` 
        }
      ],
      opacity: interpolate(wave, [0, 1], [0, 0.7]),
    };
  });

  // Psychedelic rotation chaos
  const psychedelicStyle = useAnimatedStyle(() => {
    const psycho = psychedelicRotation.value;
    
    return {
      transform: [
        { 
          rotate: `${interpolate(psycho, [0, 1], [0, 1080])}deg` 
        },
        { 
          scale: interpolate(psycho, [0, 1], [1, 0.1]) 
        }
      ],
      opacity: interpolate(psycho, [0, 1], [0, 0.9]),
    };
  });

  // Blackout overlay
  const blackoutStyle = useAnimatedStyle(() => ({
    opacity: blackoutOpacity.value,
  }));

  // Recovery glitch
  const recoveryStyle = useAnimatedStyle(() => ({
    opacity: glitchRecovery.value,
  }));

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      {/* Base melting distortion */}
      <Animated.View style={[styles.meltingLayer, meltingStyle]}>
        <LinearGradient
          colors={['#FF2EC0', '#00FFF7', '#FFB000', '#FF0080']}
          style={styles.meltGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Color swirl overlay */}
      <Animated.View style={[styles.colorSwirlLayer, colorSwirlStyle]}>
        <LinearGradient
          colors={[
            'rgba(255, 46, 192, 0.8)',
            'rgba(0, 255, 247, 0.6)',
            'rgba(255, 184, 0, 0.7)',
            'rgba(255, 0, 128, 0.9)'
          ]}
          style={styles.swirlGradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>

      {/* Vertical drip effect */}
      <Animated.View style={[styles.verticalDripLayer, verticalDripStyle]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`drip-${i}`}
            style={[
              styles.dripStreak,
              {
                left: (i * width) / 20 + Math.random() * 20 - 10,
                backgroundColor: ['#FF2EC0', '#00FFF7', '#FFB000'][i % 3],
                width: Math.random() * 8 + 2,
                opacity: 0.6 + Math.random() * 0.4,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Horizontal wave distortion */}
      <Animated.View style={[styles.horizontalWaveLayer, horizontalWaveStyle]}>
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`wave-${i}`}
            style={[
              styles.waveBar,
              {
                top: (i * height) / 15 + Math.random() * 30 - 15,
                backgroundColor: ['#FF2EC0', '#00FFF7', '#FFB000', '#FFFFFF'][i % 4],
                height: Math.random() * 20 + 5,
                opacity: 0.4 + Math.random() * 0.6,
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Psychedelic chaos overlay */}
      <Animated.View style={[styles.psychedelicLayer, psychedelicStyle]}>
        <LinearGradient
          colors={[
            '#FF2EC0',
            '#00FFF7',
            '#FFB000',
            '#FF0080',
            '#00FF00',
            '#FF2EC0'
          ]}
          style={styles.psychedelicGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Pixel noise corruption */}
      <View style={styles.pixelNoiseLayer}>
        {Array.from({ length: 300 }).map((_, i) => (
          <View
            key={`noise-${i}`}
            style={[
              styles.noisePixel,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                backgroundColor: [
                  '#FF2EC0', '#00FFF7', '#FFB000', '#FFFFFF', 
                  '#FF0080', '#00FF00', '#000000'
                ][Math.floor(Math.random() * 7)],
                width: Math.random() * 6 + 1,
                height: Math.random() * 6 + 1,
                opacity: 0.3 + Math.random() * 0.7,
              }
            ]}
          />
        ))}
      </View>

      {/* Blackout overlay */}
      <Animated.View style={[styles.blackoutLayer, blackoutStyle]} />

      {/* Recovery glitch flash */}
      <Animated.View style={[styles.recoveryGlitchLayer, recoveryStyle]} />

      {/* Emergency tap zone */}
      <TouchableOpacity
        style={styles.emergencyTapZone}
        onPress={handleTopLeftTap}
        activeOpacity={1}
      />

      {/* Tap indicators */}
      {tapCount > 0 && (
        <View style={styles.tapIndicator}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.tapDot,
                { 
                  backgroundColor: i < tapCount ? '#00FFF7' : '#333333',
                  transform: [{ scale: i < tapCount ? 1.2 : 1 }]
                }
              ]}
            />
          ))}
        </View>
      )}

      {/* Blackout message */}
      {isBlackout && (
        <View style={styles.blackoutMessage}>
          <Animated.Text style={[styles.blackoutText, recoveryStyle]}>
            SYSTEM CORRUPTED
          </Animated.Text>
          <Animated.Text style={[styles.blackoutSubtext, recoveryStyle]}>
            TAP TOP-LEFT CORNER 3X TO RECOVER
          </Animated.Text>
        </View>
      )}
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
  meltingLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  meltGradient: {
    flex: 1,
  },
  colorSwirlLayer: {
    position: 'absolute',
    top: -height,
    left: -width,
    width: width * 3,
    height: height * 3,
  },
  swirlGradient: {
    flex: 1,
  },
  verticalDripLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dripStreak: {
    position: 'absolute',
    top: 0,
    height: height * 2,
  },
  horizontalWaveLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveBar: {
    position: 'absolute',
    left: -width * 0.5,
    width: width * 2,
  },
  psychedelicLayer: {
    position: 'absolute',
    top: -height,
    left: -width,
    width: width * 3,
    height: height * 3,
  },
  psychedelicGradient: {
    flex: 1,
  },
  pixelNoiseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noisePixel: {
    position: 'absolute',
  },
  blackoutLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  recoveryGlitchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    mixBlendMode: 'difference',
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
    gap: 8,
  },
  tapDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  blackoutMessage: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
  },
  blackoutText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    color: '#FF0080',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  blackoutSubtext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    textAlign: 'center',
    opacity: 0.8,
  },
});
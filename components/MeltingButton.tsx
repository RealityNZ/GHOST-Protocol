import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate
} from 'react-native-reanimated';

interface MeltingButtonProps {
  onActivate: () => void;
}

export default function MeltingButton({ onActivate }: MeltingButtonProps) {
  const liquidFlow = useSharedValue(0);
  const colorShift = useSharedValue(0);
  const textDrip = useSharedValue(0);

  useEffect(() => {
    // Liquid flow animation
    liquidFlow.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      true
    );

    // Color shifting
    colorShift.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );

    // Occasional text drip
    const dripInterval = setInterval(() => {
      textDrip.value = withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 400 })
      );
    }, 6000 + Math.random() * 8000);

    return () => clearInterval(dripInterval);
  }, []);

  const liquidStyle = useAnimatedStyle(() => {
    const flow = liquidFlow.value;
    
    return {
      transform: [
        { 
          scaleY: interpolate(flow, [0, 1], [1, 1.2]) 
        },
        { 
          translateY: interpolate(flow, [0, 1], [0, 3]) 
        }
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const drip = textDrip.value;
    
    return {
      transform: [
        { 
          scaleY: interpolate(drip, [0, 1], [1, 1.5]) 
        },
        { 
          translateY: interpolate(drip, [0, 1], [0, 8]) 
        }
      ],
    };
  });

  const gradientColors = [
    ['#FF2EC0', '#FFB000', '#00FFF7'],
    ['#00FFF7', '#FF0080', '#FFB000'],
    ['#FFB000', '#FF2EC0', '#00FF00'],
    ['#FF0080', '#00FFF7', '#FF2EC0']
  ];

  const colorIndex = Math.floor(colorShift.value * gradientColors.length) % gradientColors.length;

  return (
    <TouchableOpacity onPress={onActivate} activeOpacity={0.8}>
      <Animated.View style={[styles.container, liquidStyle]}>
        <LinearGradient
          colors={gradientColors[colorIndex]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Droplets size={16} color="#FFFFFF" strokeWidth={3} />
          <Animated.Text style={[styles.text, textStyle]}>
            MELT SCREEN
          </Animated.Text>
        </LinearGradient>
        
        {/* Dripping effect overlay */}
        <View style={styles.dripOverlay}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dripDot,
                {
                  left: 20 + i * 25,
                  backgroundColor: '#FFFFFF',
                  opacity: 0.3 + Math.random() * 0.4,
                  animationDelay: `${i * 200}ms`,
                }
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#FFB000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    gap: 8,
  },
  text: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dripOverlay: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 10,
    flexDirection: 'row',
  },
  dripDot: {
    position: 'absolute',
    width: 3,
    height: 8,
    borderRadius: 1.5,
  },
});
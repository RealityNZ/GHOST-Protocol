import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';

interface GlitchBombButtonProps {
  onActivate: () => void;
}

export default function GlitchBombButton({ onActivate }: GlitchBombButtonProps) {
  const glowIntensity = useSharedValue(0);
  const textGlitch = useSharedValue(0);

  useEffect(() => {
    // Pulsing glow effect
    glowIntensity.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    // Occasional text glitch
    const glitchInterval = setInterval(() => {
      textGlitch.value = withSequence(
        withTiming(3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
        withTiming(-2, { duration: 30 }),
        withTiming(0, { duration: 70 })
      );
    }, 5000 + Math.random() * 10000);

    return () => clearInterval(glitchInterval);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + glowIntensity.value * 0.7,
    shadowRadius: 10 + glowIntensity.value * 20,
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textGlitch.value }],
  }));

  return (
    <TouchableOpacity onPress={onActivate} activeOpacity={0.8}>
      <Animated.View style={[styles.container, glowStyle]}>
        <LinearGradient
          colors={['#FF2EC0', '#FF0080', '#FF2EC0']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Zap size={16} color="#FFFFFF" strokeWidth={3} />
          <Animated.Text style={[styles.text, textStyle]}>
            GLITCH BOMB
          </Animated.Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    shadowColor: '#FF2EC0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
});
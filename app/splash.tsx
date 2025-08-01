import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const glitchOffset = useSharedValue(0);

  useEffect(() => {
    // Sequence animation
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });
    
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));

    // Glitch effect
    setTimeout(() => {
      glitchOffset.value = withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withTiming(-3, { duration: 50 }),
        withTiming(0, { duration: 50 }),
        withTiming(2, { duration: 30 }),
        withTiming(0, { duration: 70 })
      );
    }, 1500);

    // Navigate to tabs after animation
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 3000);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateX: glitchOffset.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      {/* Background Effects */}
      <View style={styles.backgroundGrid}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridLine,
              {
                top: (i * height) / 20,
                backgroundColor: '#00FFF7',
                opacity: 0.02,
              }
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Eye size={80} color="#FF2EC0" strokeWidth={1.5} />
        </Animated.View>

        <Animated.View style={titleStyle}>
          <Text style={styles.title}>VICE</Text>
          <Text style={styles.subtitle}>LOGGER</Text>
        </Animated.View>

        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>Neural Surveillance Protocol</Text>
        </Animated.View>
      </View>

      {/* Static overlay */}
      <View style={styles.staticOverlay} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  backgroundGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    borderRadius: 20,
  },
  title: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 48,
    color: '#00FFF7',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    color: '#FF2EC0',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 14,
    color: '#AAAAAA',
    letterSpacing: 2,
    textAlign: 'center',
    opacity: 0.8,
  },
  staticOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 46, 192, 0.01)',
    pointerEvents: 'none',
  },
});
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay
} from 'react-native-reanimated';

export default function SplashScreen() {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    // Simple animation sequence
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 800 });
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // Navigate to tabs after delay
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Eye size={80} color="#FF2EC0" strokeWidth={1.5} />
        </Animated.View>

        <Animated.View style={titleStyle}>
          <Text style={styles.title}>VICE</Text>
          <Text style={styles.subtitle}>LOGGER</Text>
          <Text style={styles.tagline}>Neural Surveillance Protocol</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
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
});
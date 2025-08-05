import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { useFonts, JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [fontsLoaded, fontError] = useFonts({
    'JetBrainsMono-Regular': JetBrainsMono_400Regular,
    'JetBrainsMono-Bold': JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0C0C0C', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#00FFF7', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  // Show error screen if font loading failed
  if (fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0C0C0C', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FF0080', fontSize: 16 }}>Font loading error</Text>
        <Text style={{ color: '#AAAAAA', fontSize: 12, marginTop: 8 }}>Continuing with system fonts...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#0C0C0C" />
    </>
  );
}
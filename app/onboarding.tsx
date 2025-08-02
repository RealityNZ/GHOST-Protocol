import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import OnboardingFlow from '@/components/OnboardingFlow';

export default function OnboardingScreen() {
  const handleComplete = () => {
    // Navigate to main app after onboarding
    router.replace('/(tabs)');
  };

  return (
    <OnboardingFlow onComplete={handleComplete} />
  );
}
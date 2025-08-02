import { useState, useCallback, useRef } from 'react';

export function useGlitchCore() {
  const [isGlitchActive, setIsGlitchActive] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretTap = useCallback(() => {
    tapCountRef.current += 1;

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Check if we've reached 3 taps
    if (tapCountRef.current >= 3) {
      if (isGlitchActive) {
        // Disable glitch mode
        setIsGlitchActive(false);
        console.log('🔥 GlitchCore DISABLED');
      } else {
        // Enable glitch mode
        setIsGlitchActive(true);
        console.log('🔥 GlitchCore ACTIVATED - DIGITAL CHAOS MODE');
      }
      tapCountRef.current = 0;
      return;
    }

    // Reset tap count after 1 second if not completed
    tapTimeoutRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1000);

    console.log(`🔥 Secret tap ${tapCountRef.current}/3`);
  }, [isGlitchActive]);

  const activateGlitch = useCallback(() => {
    setIsGlitchActive(true);
    console.log('🔥 GlitchCore FORCE ACTIVATED');
  }, []);

  const deactivateGlitch = useCallback(() => {
    setIsGlitchActive(false);
    console.log('🔥 GlitchCore DEACTIVATED');
  }, []);

  return {
    isGlitchActive,
    handleSecretTap,
    activateGlitch,
    deactivateGlitch,
  };
}
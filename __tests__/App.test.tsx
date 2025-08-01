import React from 'react';
import { render, screen } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { NavigationContainer } from '@react-navigation/native';
import FeedScreen from '@/app/(tabs)/index';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return React.createElement(View, props, children);
  }
}));

// Mock background effects
jest.mock('@/components/BackgroundEffects', () => {
  const { View } = require('react-native');
  return function MockBackgroundEffects() {
    return React.createElement(View, { testID: 'background-effects' });
  };
});

// Mock log entry animated
jest.mock('@/components/LogEntryAnimated', () => {
  const { View } = require('react-native');
  return function MockLogEntryAnimated({ children }: any) {
    return React.createElement(View, { testID: 'log-entry-animated' }, children);
  };
});

describe('FeedScreen', () => {
  it('renders surveillance feed header', () => {
    render(
      <NavigationContainer>
        <FeedScreen />
      </NavigationContainer>
    );
    
    expect(screen.getByText('SURVEILLANCE FEED')).toBeTruthy();
  });

  it('displays live indicator', () => {
    render(
      <NavigationContainer>
        <FeedScreen />
      </NavigationContainer>
    );
    
    expect(screen.getByText('LIVE')).toBeTruthy();
  });

  it('shows intercepted communications section', () => {
    render(
      <NavigationContainer>
        <FeedScreen />
      </NavigationContainer>
    );
    
    expect(screen.getByText('INTERCEPTED COMMUNICATIONS')).toBeTruthy();
  });

  it('displays message statistics', () => {
    render(
      <NavigationContainer>
        <FeedScreen />
      </NavigationContainer>
    );
    
    expect(screen.getByText('1,247')).toBeTruthy();
    expect(screen.getByText('MESSAGES')).toBeTruthy();
    expect(screen.getByText('89')).toBeTruthy();
    expect(screen.getByText('IMAGES')).toBeTruthy();
  });
});
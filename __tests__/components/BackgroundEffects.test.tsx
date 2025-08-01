import React from 'react';
import { render } from '@testing-library/react-native';
import BackgroundEffects from '@/components/BackgroundEffects';

describe('BackgroundEffects', () => {
  it('renders with default props', () => {
    const { getByTestId } = render(<BackgroundEffects />);
    // Component should render without crashing
    expect(getByTestId).toBeDefined();
  });

  it('renders with surveillance variant', () => {
    const { getByTestId } = render(
      <BackgroundEffects variant="surveillance" intensity="medium" />
    );
    expect(getByTestId).toBeDefined();
  });

  it('renders with neural variant', () => {
    const { getByTestId } = render(
      <BackgroundEffects variant="neural" intensity="intense" />
    );
    expect(getByTestId).toBeDefined();
  });

  it('renders with system variant', () => {
    const { getByTestId } = render(
      <BackgroundEffects variant="system" intensity="subtle" />
    );
    expect(getByTestId).toBeDefined();
  });
});
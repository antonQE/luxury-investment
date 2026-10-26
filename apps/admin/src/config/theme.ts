import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const themeConfig = defineConfig({
  globalCss: {
    body: {
      bg: 'background.page',
      color: 'text.primary',
      fontFamily: 'body',
      letterSpacing: '0.01em',
    },
    '::selection': {
      bg: 'rgba(176, 141, 77, 0.28)',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: {
          value: '"Source Serif 4", "Times New Roman", Georgia, serif',
        },
        body: {
          value: '"Source Sans 3", "Segoe UI", system-ui, sans-serif',
        },
      },
      radii: {
        l1: { value: '0' },
        l2: { value: '0' },
        l3: { value: '0' },
      },
    },
    semanticTokens: {
      colors: {
        'text.primary': { value: '#14161c' },
        'text.secondary': { value: '#3a3f4a' },
        'text.muted': { value: '#6a7080' },
        'text.inverse': { value: '#f2efe9' },
        'background.page': { value: '#f2efe9' },
        'background.panel': { value: '#fffcf7' },
        'background.sidebar': { value: '#12141a' },
        'border.default': { value: '#d9d3c8' },
        'accent.gold': { value: '#a68445' },
        'accent.goldMuted': { value: 'rgba(166, 132, 69, 0.16)' },
        'status.ok': { value: '#1f7a4c' },
        'status.down': { value: '#a11d2c' },
      },
    },
  },
});

export const theme = createSystem(defaultConfig, themeConfig);

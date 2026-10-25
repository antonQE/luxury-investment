import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const themeConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'system-ui, sans-serif' },
        body: { value: 'system-ui, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        'text.primary': { value: '#1c1916' },
        'text.secondary': { value: '#3f3a34' },
        'text.muted': { value: '#6b645c' },
        'text.inverse': { value: '#fffdf8' },
        'background.page': { value: '#f6f1e8' },
        'background.panel': { value: '#fffdf8' },
        'background.sidebar': { value: '#1c1916' },
        'border.default': { value: '#e8dfd0' },
        'accent.gold': { value: '#b08d4d' },
        'status.ok': { value: '#1f7a4c' },
        'status.down': { value: '#a11d2c' },
      },
    },
  },
});

export const theme = createSystem(defaultConfig, themeConfig);

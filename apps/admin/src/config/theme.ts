import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe,
} from '@chakra-ui/react';

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
    'input[type="checkbox"], input[type="radio"]': {
      accentColor: '#a68445',
      width: '1rem',
      height: '1rem',
      borderRadius: '0.25rem',
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
        l1: { value: '0.5rem' },
        l2: { value: '0.625rem' },
        l3: { value: '0.875rem' },
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
        'background.field': { value: '#ffffff' },
        'background.tableHeader': { value: '#ebe4d8' },
        'background.rowHover': { value: 'rgba(166, 132, 69, 0.12)' },
        'border.default': { value: '#b7aea0' },
        'border.strong': { value: '#8f8678' },
        'accent.gold': { value: '#a68445' },
        'accent.goldMuted': { value: 'rgba(166, 132, 69, 0.16)' },
        'status.ok': { value: '#1f7a4c' },
        'status.okMuted': { value: 'rgba(31, 122, 76, 0.14)' },
        'status.down': { value: '#a11d2c' },
        'status.downMuted': { value: 'rgba(161, 29, 44, 0.12)' },
        'status.warn': { value: '#8a5a12' },
        'status.warnMuted': { value: 'rgba(166, 132, 69, 0.22)' },
        'status.neutral': { value: '#4a5060' },
        'status.neutralMuted': { value: 'rgba(74, 80, 96, 0.12)' },
        'status.info': { value: '#1f4f7a' },
        'status.infoMuted': { value: 'rgba(31, 79, 122, 0.12)' },
      },
    },
    recipes: {
      heading: defineRecipe({
        className: 'chakra-heading',
        base: {
          fontFamily: 'heading',
          color: 'text.primary',
          fontWeight: '600',
          letterSpacing: '-0.01em',
          lineHeight: '1.2',
        },
      }),
      input: defineRecipe({
        className: 'chakra-input',
        base: {
          width: '100%',
          minWidth: '0',
          outline: '0',
          appearance: 'none',
          borderRadius: 'l2',
          borderWidth: '1px',
          borderColor: 'border.default',
          bg: 'background.field',
          color: 'text.primary',
          height: '2.5rem',
          px: '3',
          _hover: {
            borderColor: 'border.strong',
          },
          _focusVisible: {
            borderColor: 'accent.gold',
            boxShadow: '0 0 0 1px {colors.accent.gold}',
          },
          _disabled: {
            opacity: 0.55,
            cursor: 'not-allowed',
          },
        },
      }),
      textarea: defineRecipe({
        className: 'chakra-textarea',
        base: {
          width: '100%',
          minWidth: '0',
          outline: '0',
          appearance: 'none',
          borderRadius: 'l2',
          borderWidth: '1px',
          borderColor: 'border.default',
          bg: 'background.field',
          color: 'text.primary',
          px: '3',
          py: '2',
          _hover: {
            borderColor: 'border.strong',
          },
          _focusVisible: {
            borderColor: 'accent.gold',
            boxShadow: '0 0 0 1px {colors.accent.gold}',
          },
        },
      }),
      button: defineRecipe({
        className: 'chakra-button',
        base: {
          display: 'inline-flex',
          appearance: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          borderRadius: 'l2',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          fontWeight: '600',
          letterSpacing: '0.02em',
          borderWidth: '1px',
          transitionProperty: 'background, border-color, color',
          transitionDuration: '0.15s',
          _disabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
          _focusVisible: {
            outline: '2px solid',
            outlineColor: 'accent.gold',
            outlineOffset: '2px',
          },
        },
        variants: {
          size: {
            '2xs': { h: '6', minW: '6', textStyle: 'xs', px: '2' },
            xs: { h: '8', minW: '8', textStyle: 'xs', px: '2.5' },
            sm: { h: '9', minW: '9', textStyle: 'sm', px: '3.5' },
            md: { h: '10', minW: '10', textStyle: 'sm', px: '4' },
            lg: { h: '11', minW: '11', textStyle: 'md', px: '5' },
            xl: { h: '12', minW: '12', textStyle: 'md', px: '5' },
            '2xl': { h: '16', minW: '16', textStyle: 'lg', px: '7' },
          },
          variant: {
            solid: {
              bg: 'background.sidebar',
              color: 'text.inverse',
              borderColor: 'background.sidebar',
              _hover: {
                bg: 'accent.gold',
                borderColor: 'accent.gold',
                color: 'text.inverse',
              },
            },
            outline: {
              bg: 'background.field',
              color: 'text.primary',
              borderColor: 'border.strong',
              _hover: {
                bg: 'accent.goldMuted',
                borderColor: 'accent.gold',
              },
            },
            ghost: {
              bg: 'transparent',
              color: 'text.secondary',
              borderColor: 'transparent',
              _hover: {
                bg: 'accent.goldMuted',
                color: 'text.primary',
              },
            },
            subtle: {
              bg: 'accent.goldMuted',
              color: 'text.primary',
              borderColor: 'transparent',
              _hover: {
                bg: 'accent.gold',
                color: 'text.inverse',
              },
            },
            surface: {
              bg: 'background.panel',
              color: 'text.primary',
              borderColor: 'border.default',
              _hover: {
                borderColor: 'accent.gold',
              },
            },
            plain: {
              bg: 'transparent',
              color: 'text.primary',
              borderColor: 'transparent',
            },
            danger: {
              bg: 'status.downMuted',
              color: 'status.down',
              borderColor: 'status.down',
              _hover: {
                bg: 'status.down',
                color: 'text.inverse',
              },
            },
          },
        },
        defaultVariants: {
          size: 'md',
          variant: 'solid',
        },
      }),
      badge: defineRecipe({
        className: 'chakra-badge',
        base: {
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 'l1',
          fontWeight: '600',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          px: '2',
          minH: '5',
          textStyle: 'xs',
        },
        variants: {
          variant: {
            subtle: {},
            solid: {},
            outline: {
              shadow: 'inset 0 0 0 1px var(--shadow-color)',
            },
            surface: {},
            plain: {},
          },
          size: {
            xs: { textStyle: '2xs', px: '1', minH: '4' },
            sm: { textStyle: 'xs', px: '1.5', minH: '5' },
            md: { textStyle: 'sm', px: '2', minH: '6' },
            lg: { textStyle: 'sm', px: '2.5', minH: '7' },
          },
        },
        defaultVariants: {
          variant: 'subtle',
          size: 'sm',
        },
      }),
    },
    slotRecipes: {
      nativeSelect: defineSlotRecipe({
        className: 'chakra-native-select',
        slots: ['root', 'field', 'indicator'],
        base: {
          root: {
            display: 'flex',
            width: '100%',
            position: 'relative',
            height: 'fit-content',
          },
          field: {
            width: '100%',
            minWidth: '0',
            outline: '0',
            appearance: 'none',
            borderRadius: 'l2',
            borderWidth: '1px',
            borderColor: 'border.default',
            bg: 'background.field',
            color: 'text.primary',
            height: '2.5rem',
            pl: '3',
            pr: '10',
            cursor: 'pointer',
            _hover: {
              borderColor: 'border.strong',
            },
            _focusVisible: {
              borderColor: 'accent.gold',
              boxShadow: '0 0 0 1px {colors.accent.gold}',
            },
            _disabled: {
              opacity: 0.55,
              cursor: 'not-allowed',
            },
            '& > option, & > optgroup': {
              bg: 'background.field',
              color: 'text.primary',
            },
          },
          indicator: {
            position: 'absolute',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            top: '50%',
            right: '3',
            transform: 'translateY(-50%)',
            color: 'text.muted',
          },
        },
        variants: {
          size: {
            xs: {
              field: { height: '2rem', textStyle: 'xs', pl: '2', pr: '8' },
            },
            sm: {
              field: { height: '2.25rem', textStyle: 'sm' },
            },
            md: {
              field: { height: '2.5rem', textStyle: 'sm' },
            },
            lg: {
              field: { height: '2.75rem', textStyle: 'md' },
            },
          },
        },
        defaultVariants: {
          size: 'md',
        },
      }),
      table: defineSlotRecipe({
        className: 'chakra-table',
        slots: ['root', 'header', 'body', 'row', 'columnHeader', 'cell', 'footer', 'caption'],
        base: {
          root: {
            fontVariantNumeric: 'lining-nums tabular-nums',
            borderCollapse: 'separate',
            borderSpacing: 0,
            width: 'full',
            textAlign: 'start',
            verticalAlign: 'top',
            textStyle: 'sm',
            borderRadius: 'l2',
            overflow: 'hidden',
          },
          header: {
            bg: 'background.tableHeader',
          },
          columnHeader: {
            fontWeight: '700',
            color: 'text.primary',
            borderBottomWidth: '1px',
            borderColor: 'border.strong',
            px: '3',
            py: '2.5',
            letterSpacing: '0.02em',
          },
          cell: {
            borderBottomWidth: '1px',
            borderColor: 'border.default',
            px: '3',
            py: '2.5',
            color: 'text.secondary',
          },
          row: {
            bg: 'background.panel',
            _hover: {
              bg: 'background.rowHover',
            },
          },
        },
        variants: {
          size: {
            sm: {
              root: { textStyle: 'sm' },
              columnHeader: { px: '3', py: '2' },
              cell: { px: '3', py: '2' },
            },
            md: {
              root: { textStyle: 'sm' },
            },
            lg: {
              root: { textStyle: 'md' },
            },
          },
          variant: {
            line: {},
            outline: {
              root: {
                boxShadow: '0 0 0 1px {colors.border.default}',
              },
            },
          },
          stickyHeader: {
            true: {
              header: {
                '& :where(tr)': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  bg: 'background.tableHeader',
                },
              },
            },
          },
        },
        defaultVariants: {
          size: 'sm',
          variant: 'outline',
          stickyHeader: true,
        },
      }),
    },
  },
});

export const theme = createSystem(defaultConfig, themeConfig);

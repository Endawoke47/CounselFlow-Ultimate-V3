// Corporate Professional Theme for Big Law Firms
export const corporateTheme = {
  // Primary Brand Colors - Deep, Professional Palette
  colors: {
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Main primary
      600: '#475569',
      700: '#334155', // Dark primary for headers
      800: '#1e293b',
      900: '#0f172a', // Darkest for text
    },
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // Gold accent
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    accent: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Professional blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
  },

  // Typography - Professional and Readable
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Crimson Text', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // Spacing - Consistent and Harmonious
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem',       // 384px
  },

  // Shadows - Sophisticated Depth
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },

  // Border Radius - Modern and Clean
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    md: '0.25rem',     // 4px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },

  // Z-Index Layers
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    backdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },

  // Animation and Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Component Variants
  components: {
    // Button variants for different contexts
    button: {
      primary: {
        bg: 'primary.700',
        hover: 'primary.800',
        active: 'primary.900',
        text: 'white',
        border: 'primary.700',
      },
      secondary: {
        bg: 'white',
        hover: 'neutral.50',
        active: 'neutral.100',
        text: 'primary.700',
        border: 'primary.300',
      },
      success: {
        bg: 'success.600',
        hover: 'success.700',
        active: 'success.800',
        text: 'white',
        border: 'success.600',
      },
      warning: {
        bg: 'warning.500',
        hover: 'warning.600',
        active: 'warning.700',
        text: 'white',
        border: 'warning.500',
      },
      danger: {
        bg: 'danger.600',
        hover: 'danger.700',
        active: 'danger.800',
        text: 'white',
        border: 'danger.600',
      },
    },

    // Card variants for different content types
    card: {
      default: {
        bg: 'white',
        border: 'neutral.200',
        shadow: 'md',
        padding: '6',
        radius: 'xl',
      },
      elevated: {
        bg: 'white',
        border: 'none',
        shadow: 'xl',
        padding: '8',
        radius: '2xl',
      },
      outlined: {
        bg: 'white',
        border: 'neutral.300',
        shadow: 'sm',
        padding: '6',
        radius: 'lg',
      },
    },

    // Input field styles
    input: {
      default: {
        bg: 'white',
        border: 'neutral.300',
        focus: 'accent.500',
        radius: 'lg',
        padding: '3',
      },
      error: {
        bg: 'danger.50',
        border: 'danger.300',
        focus: 'danger.500',
        radius: 'lg',
        padding: '3',
      },
    },
  },

  // Breakpoints for Responsive Design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Professional Layout Configurations
  layout: {
    sidebar: {
      width: '280px',
      collapsedWidth: '80px',
      bg: 'primary.800',
      border: 'primary.700',
    },
    header: {
      height: '72px',
      bg: 'white',
      border: 'neutral.200',
      shadow: 'sm',
    },
    content: {
      bg: 'neutral.50',
      padding: '8',
    },
  },
};

// CSS Custom Properties for Dynamic Theming
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-50: 248 250 252;
    --color-primary-100: 241 245 249;
    --color-primary-200: 226 232 240;
    --color-primary-300: 203 213 225;
    --color-primary-400: 148 163 184;
    --color-primary-500: 100 116 139;
    --color-primary-600: 71 85 105;
    --color-primary-700: 51 65 85;
    --color-primary-800: 30 41 59;
    --color-primary-900: 15 23 42;

    /* Secondary Colors */
    --color-secondary-50: 254 252 232;
    --color-secondary-100: 254 249 195;
    --color-secondary-200: 254 240 138;
    --color-secondary-300: 253 224 71;
    --color-secondary-400: 250 204 21;
    --color-secondary-500: 234 179 8;
    --color-secondary-600: 202 138 4;
    --color-secondary-700: 161 98 7;
    --color-secondary-800: 133 77 14;
    --color-secondary-900: 113 63 18;

    /* Accent Colors */
    --color-accent-50: 239 246 255;
    --color-accent-100: 219 234 254;
    --color-accent-200: 191 219 254;
    --color-accent-300: 147 197 253;
    --color-accent-400: 96 165 250;
    --color-accent-500: 59 130 246;
    --color-accent-600: 37 99 235;
    --color-accent-700: 29 78 216;
    --color-accent-800: 30 64 175;
    --color-accent-900: 30 58 138;

    /* Typography */
    --font-family-sans: 'Inter', system-ui, sans-serif;
    --font-family-serif: 'Crimson Text', Georgia, serif;
    --font-family-mono: 'JetBrains Mono', Consolas, monospace;

    /* Shadows */
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

    /* Layout */
    --sidebar-width: 280px;
    --sidebar-collapsed-width: 80px;
    --header-height: 72px;
  }
`;

export default corporateTheme;
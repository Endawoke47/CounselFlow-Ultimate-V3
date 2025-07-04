/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      fontFamily: {
        title: 'var(--poppins)',
        text: 'var(--roboto)',
      },
      fontSize: {
        '34px': '34px',
        '48px': '48px',
      },
      colors: {
        error: {
          dark: '#93140B',
          base: '#F04438',
          light: '#FEE4E2',
          lighter: '#FEF3F2',
        },
        warning: {
          dark: '#995905',
          base: '#F79009',
          light: '#FEF0C7',
          lighter: '#FFFAEB',
        },
        success: {
          dark: '#065636',
          base: '#12B76A',
          light: '#D1FADF',
          lighter: '#ECFDF3',
        },
        disabled: {
          base: '#B1B1B1',
          button: '#E0E0E0',
        },
        backgroundpage: {
          grey: '#2F3747',
        },
        divider: {
          'light-grey': '#CBD5E1',
        },
        header: {
          'light-grey': '#F1F5F9',
          'light-blue': '#DBEAFE',
        },
        sidebar: {
          'hover-blue': '#2563EB',
        },
        account: {
          grey: '#EEEEEE',
          'text-grey': '#64748B',
          'separator-grey': '#94A3B8',
        },
        dashboard: {
          'lighter-blue': '#F8FAFC',
          'border-deep-blue': '#E2E8F0',
          blue: '#2563EB',
        },
        'main-dashboard': {
          blue: '#60A5FA',
          grey: '#1E293B',
          lime: '#A3E635',
          green: '#16A34A',
        },

        // Colors from the tailwind basic setup & integration with the UI set
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        navforeground: 'hsl(var(--nav-foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          active: 'hsl(var(--primary-active))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          active: 'hsl(var(--destructive-active))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          active: 'hsl(var(--accent-active))',
        },
        accentnav: {
          DEFAULT: 'hsl(var(--accent-nav))',
          foreground: 'hsl(var(--accent-nav-foreground))',
          active: 'hsl(var(--accent-nav-active))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
          'dark-blue': '#334155',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      transitionProperty: {
        background: 'background',
      },
      boxShadow: {
        custom: '0px 2px 20px 4px rgba(0, 0, 0, 0.16)',
        'main-dashboard-top': '0px 0px 10px 4px rgba(0,0,0,0.1)',
        'top-container':
          '0px -4px 6px -1px rgba(0, 0, 0, 0.1), 4px 0px 6px -1px rgba(0, 0, 0, 0.1), -4px 0px 6px -1px rgba(0, 0, 0, 0.1)',
        'bottom-container':
          '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 4px 0px 6px -1px rgba(0, 0, 0, 0.1), -4px 0px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

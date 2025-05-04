import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors: {
    brand: {
      background: '#F1EDDF',
      primary: '#336636',
      accent: '#A1BA30',
      light: '#C3CD6A',
    },
    success: {
      50: '#E7F5E7',
      100: '#C2E5C9',
      500: '#38A169',
      600: '#2F855A',
    },
    warning: {
      50: '#FFF5E5',
      100: '#FFEAC2',
      500: '#DD6B20',
      600: '#C05621',
    },
    error: {
      50: '#FEE2E2',
      100: '#FCA5A5',
      500: '#E53E3E',
      600: '#C53030',
    },
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'brand.primary',
          color: 'white',
          _hover: {
            bg: 'brand.primary',
            opacity: 0.9,
          },
        },
        secondary: {
          bg: 'brand.accent',
          color: 'gray.800',
          _hover: {
            bg: 'brand.accent',
            opacity: 0.9,
          },
        },
        outline: {
          borderColor: 'brand.primary',
          color: 'brand.primary',
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: 'gray.200',
            bg: 'gray.50',
          },
          td: {
            borderColor: 'gray.200',
          },
        },
      },
    },
  },
});
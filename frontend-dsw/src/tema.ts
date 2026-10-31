import { createTheme } from '@mui/material/styles';

export const tema = createTheme({
  palette: {
    primary: { main: '#8D6700', dark: '#6F5100', light: '#FAF5E6', contrastText: '#FFFFFF' },
    background: { default: '#F8F9FA', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#4B5563' },
    divider: '#DEE1E6',
    // Los estados conservan colores propios, independientes de la marca.
    info: { main: '#0277BD' },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: { fontSize: '2.25rem', fontWeight: 750, lineHeight: 1.2, color: '#6F5100', '@media (max-width:599px)': { fontSize: '1.75rem' } },
    h5: { fontSize: '1.5rem', fontWeight: 700, color: '#6F5100' },
    h6: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35 },
    body1: { lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { minHeight: 48, borderRadius: 8 } } },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiCardActionArea: { styleOverrides: { root: { minHeight: 72, '&:hover': { backgroundColor: '#FAF5E6' } } } },
    MuiDialogTitle: { styleOverrides: { root: { color: '#6F5100', fontWeight: 700 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiContainer: { styleOverrides: { root: { '@media (max-width:599px)': { paddingLeft: 16, paddingRight: 16 } } } },
    MuiCssBaseline: { styleOverrides: {
      'body': { margin: 0 },
      '*': { boxSizing: 'border-box' },
      ':focus-visible': { outline: '3px solid #0277BD', outlineOffset: 3 },
    } },
  },
});

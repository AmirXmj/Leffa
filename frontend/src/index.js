import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// Create a theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: [
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render( <
    React.StrictMode >
    <
    ThemeProvider theme = { theme } >
    <
    CssBaseline / >
    <
    App / >
    <
    /ThemeProvider> <
    /React.StrictMode>
);
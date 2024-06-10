import {createTheme} from '@mui/material/styles';
import {createContext, useState, useMemo} from "react";
import {amber, blue, brown, grey, lightGreen, red, teal} from "@mui/material/colors";


export const themeSettings = (mode) => {

    return {
        palette: {
            mode: mode,
            ...(mode === 'light'
                ? {
                    primary: {
                        main: teal[500],
                    },
                    secondary: {
                        main: brown[800]
                    },
                    background: {
                        light: '#fcfcfc',
                        main: '#FAFCFE',
                        dark: '#f5f5f5',
                        contrast: '#f3f3f3',
                        contrastText: "#191919",
                    },
                    soft: {
                        warning: {
                            light: amber[50],
                            main: amber[700],
                        },
                        success: {
                            light: lightGreen[50],
                            main: lightGreen[700],
                        },
                        info: {
                            light: blue[50],
                            main: blue[700],
                        },
                        error: {
                            light: red[50],
                            main: red[700],
                        },
                        default: {
                            light: grey[200],
                            regular: grey[300],
                            main: grey[700],
                        }
                    },
                    grey: {
                        light: grey[100],
                        main: grey[200],
                        dark: grey[300],
                        contrast: grey[500],
                        contrastText: grey[700],
                    },
                    shadow: {
                        light: "0 2px 4px rgba(0,0,0,0.2)",
                        main: "0 2px 4px rgba(210,227,247,0.4)",
                    }
                }
                : {
                    primary: {
                        main: teal[500],
                    },
                    secondary: {
                        main: brown[800]
                    },
                    background: {
                        light: '#3d3d3d',
                        main: '#272727',
                        dark: '#333333',
                        contrast: '#555555',
                        contrastText: "#FAFCFE",
                    },
                    soft: {
                        warning: {
                            light: amber[50] + "10",
                            main: amber[700],
                        },
                        success: {
                            light: lightGreen[50] + "10",
                            main: lightGreen[700],
                        },
                        info: {
                            light: blue[50] + "10",
                            main: blue[700],
                        },
                        error: {
                            light: red[50] + "10",
                            main: red[700],
                        },
                        default: {
                            light: grey[700] + "52",
                            regular: grey[800] + "52",
                            main: grey[200] + "ff",
                        },
                    },
                    grey: {
                        light: "#777777",
                        main: "#555555",
                        dark: "#222222",
                        contrast: "#999999",
                        contrastText: "#f5f5f5",
                    }
                }),
        },
        components: {
            MuiChip: {
                styleOverrides: {
                    root: ({ownerState, theme}) => (
                        ownerState.variant === "soft" &&
                        {
                            backgroundColor: ownerState.color === "success" ? theme.palette.soft.success.light : ownerState.color === "info" ? theme.palette.soft.info.light : ownerState.color === "warning" ? theme.palette.soft.warning.light : ownerState.color === "error" ? theme.palette.soft.error.light : theme.palette.soft.default.light,
                            color: ownerState.color === "success" ? theme.palette.soft.success.main : ownerState.color === "info" ? theme.palette.soft.info.main : ownerState.color === "warning" ? theme.palette.soft.warning.main : ownerState.color === "error" ? theme.palette.soft.error.main : theme.palette.soft.default.main,
                        }
                    )
                }
            },
            MuiButtonBase: {
                styleOverrides: {
                    root: {
                        borderRadius: "0.475rem !important",
                    },
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: ({ownerState, theme}) => (
                        ownerState.variant === "soft"
                        && {
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "0.5rem",
                            backgroundColor: ownerState.color === "success" ? theme.palette.soft.success.light : ownerState.color === "info" ? theme.palette.soft.info.light : ownerState.color === "warning" ? theme.palette.soft.warning.light : ownerState.color === "error" ? theme.palette.soft.error.light : theme.palette.soft.default.light,
                            color: ownerState.color === "success" ? theme.palette.soft.success.main : ownerState.color === "info" ? theme.palette.soft.info.main : ownerState.color === "warning" ? theme.palette.soft.warning.main : ownerState.color === "error" ? theme.palette.soft.error.main : theme.palette.soft.default.main,
                            ...theme.components.MuiButtonBase,
                            "&:hover": {
                                backgroundColor: ownerState.color === "success" ? theme.palette.soft.success.light : ownerState.color === "info" ? theme.palette.soft.info.light : ownerState.color === "warning" ? theme.palette.soft.warning.light : ownerState.color === "error" ? theme.palette.soft.error.light : theme.palette.soft.default.regular,
                                color: ownerState.color === "success" ? theme.palette.soft.success.main : ownerState.color === "info" ? theme.palette.soft.info.main : ownerState.color === "warning" ? theme.palette.soft.warning.main : ownerState.color === "error" ? theme.palette.soft.error.main : theme.palette.soft.default.main,
                            },

                        }
                    )
                }
            },
            MuiInputBase: {
                styleOverrides: {
                    root: {
                        borderRadius: "0.475rem !important"
                    }
                }
            }
        }

    }
}


export const ColorModeContext = createContext({
    toggleColorMode: () => {
    }
})

export const useMode = () => {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) =>
                    prevMode === 'light' ? 'dark' : 'light',
                );
            },
        }),
        []
    );

    const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

    return [theme, colorMode]
}

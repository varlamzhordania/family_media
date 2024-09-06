import {createTheme} from '@mui/material/styles';
import {createContext, useState, useMemo} from "react";
import {amber, blue, brown, green, grey, lightGreen, red, teal, yellow} from "@mui/material/colors";
import {DARK_BACKGROUND, DARK_GREY, LIGHT_BACKGROUND, LIGHT_GREY, PRIMARY, SECONDARY} from "./VARIABLES.js"


export const themeSettings = (mode) => {
    const styleSoft = (color, label) => ({
        props: {variant: "soft", color: label},
        style: {
            "&:hover": {
                backgroundColor: color["100"]
            },
            backgroundColor: color["50"],
            color: color["500"],
        },
    });

    return {
        palette: {
            mode: mode,
            ...(mode === 'light'
                ? {
                    primary: PRIMARY,
                    secondary: SECONDARY,
                    background: LIGHT_BACKGROUND,
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
                            light: "rgba(0,0,0,0.6)",
                            regular: grey[300],
                            main: "white",
                            dark: "rgba(0,0,0,0.7)",
                        }
                    },
                    grey: LIGHT_GREY,
                }
                : {
                    primary: PRIMARY,
                    secondary: SECONDARY,
                    background: DARK_BACKGROUND,
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
                    grey: DARK_GREY
                }),
        },
        props: {
            MuiList: {
                dense: true,
            },
            MuiMenuItem: {
                dense: true,
            },
            MuiTable: {
                size: 'small',
            },
            MuiButton: {
                size: 'small',
            },
            MuiButtonGroup: {
                size: 'small',
            },
            MuiCheckbox: {
                size: 'small',
            },
            MuiFab: {
                size: 'small',
            },
            MuiFormControl: {
                margin: 'dense',
                size: 'small',
            },
            MuiFormHelperText: {
                margin: 'dense',
            },
            MuiIconButton: {
                size: 'small',
            },
            MuiInputBase: {
                margin: 'dense',
            },
            MuiInputLabel: {
                margin: 'dense',
            },
            MuiRadio: {
                size: 'small',
            },
            MuiSwitch: {
                size: 'small',
            },
            MuiTextField: {
                margin: 'dense',
                size: 'small',
            },
            MuiTooltip: {
                arrow: true,
            },
        },
        shape: {
            borderRadius: 8,
        },
        spacing: 8,
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
            MuiButton: {
                defaultProps: {
                    size: "small",
                },
                variants: [
                    {
                        props: {variant: "soft", color: "dark"},
                        style: {
                            "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.6)",
                            },
                            backgroundColor: "rgba(0,0,0,0.4)",
                            color: "#F5F5F5",
                        },
                    },
                    {
                        props: {variant: "soft", color: "grey"},
                        style: {
                            "&:hover": {
                                backgroundColor: grey[300],
                            },
                            backgroundColor: grey[200],
                            color: grey[700],
                        },
                    },
                    styleSoft(teal, "primary"),
                    styleSoft(brown, "secondary"),
                    styleSoft(blue, "info"),
                    styleSoft(yellow, "warning"),
                    styleSoft(green, "success"),
                    styleSoft(red, "error"),
                ]
            },
            MuiInputBase: {
                defaultProps: {
                    size: "small",
                }
            },
            MuiIconButton: {
                defaultProps: {
                    size: "small",
                    // disableRipple: true,
                },
                styleOverrides: {
                    root: ({ownerState, theme}) => (
                        ownerState.variant === "soft" &&
                        {
                            backgroundColor: ownerState.color === "primary" ? theme.palette.primary.light + "2b" : ownerState.color === "success" ? theme.palette.soft.success.light + "2b" : ownerState.color === "info" ? theme.palette.info.main + "2b" : ownerState.color === "warning" ? theme.palette.warning.main + "2b" : ownerState.color === "error" ? theme.palette.soft.error.light + "2b" : theme.palette.soft.default.light,
                            color: ownerState.color === "primary" ? theme.palette.primary.main : ownerState.color === "success" ? theme.palette.soft.success.main : ownerState.color === "info" ? theme.palette.info.main : ownerState.color === "warning" ? theme.palette.warning.light : ownerState.color === "error" ? theme.palette.soft.error.main : theme.palette.soft.default.main,
                            "&:hover": {
                                backgroundColor: ownerState.color === "primary" ? theme.palette.primary.light + "45" : ownerState.color === "success" ? theme.palette.soft.success.light + "45" : ownerState.color === "info" ? theme.palette.info.light + "45" : ownerState.color === "warning" ? theme.palette.warning.light + "45" : ownerState.color === "error" ? theme.palette.soft.error.light + "45" : theme.palette.soft.default.light
                            }
                        }
                    )
                }
            },
            MuiInputLabel: {
                defaultProps: {
                    size: "small",
                }
            },
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true,
                },
            },
            MuiSkeleton: {
                defaultProps: {
                    animation: "wave",
                },
            },
            MuiTooltip: {
                defaultProps: {
                    arrow: true
                }
            },
            MuiPaper: {
                defaultProps: {
                    elevation: 1,
                }
            },
            MuiCard: {
                defaultProps: {
                    elevation: 1,
                },
            },
            MuiAppBar: {
                defaultProps: {
                    elevation: 1,
                },
            }


        },
        StickyTop: 80,

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

import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import {Outlet} from "react-router-dom";
import {ColorModeContext, useMode} from "../features/theme/theme.js";
import {ThemeProvider} from "@mui/material";

const RootLayout = ({children}) => {
    const [theme, colorMode] = useMode();

    return (
        <React.Fragment>
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    {children}
                    <Outlet/>
                </ThemeProvider>
            </ColorModeContext.Provider>
        </React.Fragment>
    )
}

export default RootLayout
import CssBaseline from "@mui/material/CssBaseline";
import {ColorModeContext, useMode} from "@lib/theme/theme.js";
import {ThemeProvider} from "@mui/material";
import {Toaster} from "react-hot-toast";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'
import {Suspense} from "react";
import Loader from "@components/Loader/Loader.jsx";

const RootLayout = ({children}) => {
    const [theme, colorMode] = useMode();

    return (
        <Suspense fallback={<Loader/>}>
            <ColorModeContext.Provider value={colorMode}>
                    <ThemeProvider theme={theme}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <CssBaseline/>
                            <Toaster position={"top-right"} toastOptions={{duration: 3000}}/>
                            {children}
                        </LocalizationProvider>
                    </ThemeProvider>
            </ColorModeContext.Provider>
        </Suspense>
    )
}

export default RootLayout
import CssBaseline from "@mui/material/CssBaseline";
import {ColorModeContext, useMode} from "@lib/theme/theme.js";
import {ThemeProvider} from "@mui/material";
import {Toaster} from "react-hot-toast";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs'

const RootLayout = ({children}) => {
    const [theme, colorMode] = useMode();

    return (
            <ColorModeContext.Provider value={colorMode}>
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <CssBaseline/>
                        <Toaster position={"top-right"} toastOptions={{duration: 3000}}/>
                        {children}
                    </LocalizationProvider>
                </ThemeProvider>
            </ColorModeContext.Provider>
    )
}

export default RootLayout
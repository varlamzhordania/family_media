import {Box, LinearProgress} from "@mui/material";

const Loader = () => {
    return (
        <Box sx={{
            width: "100%",
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <Box
                component="img"
                src="/logo2edited.png"
                alt="Loading..."
            />
            <LinearProgress color={"success"} sx={{width: "100%", maxWidth: "300px"}}/>
        </Box>
    );
}



export default Loader;

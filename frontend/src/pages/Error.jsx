import {Link, useRouteError} from "react-router-dom";
import {Box, Button, Container, Typography} from "@mui/material";

export default function ErrorPage() {
    const error = useRouteError();

    // Handle cases where error is not defined or null
    if (!error) {
        return (
            <Container>
                <Typography variant="h2">Oops!</Typography>
                <Typography variant="body1">Sorry, an unexpected error has occurred.</Typography>
            </Container>
        );
    }

    return (
        <Container className={"center-container"}>
            <Box textAlign="center">
                <Typography variant="h1" fontWeight="bold" gutterBottom>
                    {error.status || "ERROR"}
                </Typography>
                <Typography variant="body1" paragraph>
                    Sorry, an unexpected error has occurred.
                </Typography>
                <Typography variant="subtitle1" fontStyle="italic">
                    {error.statusText || error.message}
                </Typography>
                <Button
                    component={Link}
                    to="/"
                    variant="text"
                    sx={{marginTop: 3}}
                    color="primary"
                >
                    Go Back Home
                </Button>
            </Box>
        </Container>
    );
}

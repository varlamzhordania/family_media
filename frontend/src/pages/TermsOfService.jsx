import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

export default function TermsOfService() {
    return (
        <Card elevation={0}>
            <CardHeader
                title="Terms of Service"
                titleTypographyProps={{
                    fontWeight: "bold",
                    fontSize: 36,
                    color: "primary",
                    textAlign: "center",
                }}
                sx={{ paddingBottom: 2 }}
            />
            <CardContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Typography>
                        Welcome to our family platform. By using our service, you agree to the following terms.
                    </Typography>

                    <Typography variant="h6">Accounts</Typography>
                    <Typography>
                        - You must use accurate information when creating an account.<br/>
                        - You must be part of a real family group to join or create one.<br/>
                        - You are responsible for all activity under your account.
                    </Typography>

                    <Typography variant="h6">Acceptable Use</Typography>
                    <Typography>
                        - You must not use the platform for illegal, abusive, or harmful activities.<br/>
                        - You must respect the privacy and safety of other users.<br/>
                        - Sharing inappropriate or offensive content is prohibited.
                    </Typography>

                    <Typography variant="h6">Termination</Typography>
                    <Typography>
                        We may suspend or terminate your account if you violate these terms or misuse the platform.
                    </Typography>

                    <Typography variant="h6">Disclaimer</Typography>
                    <Typography>
                        We provide this service "as is" without warranties. We are not liable for any damages
                        arising from your use of the service.
                    </Typography>

                    <Typography variant="h6">Updates</Typography>
                    <Typography>
                        These terms may be updated from time to time. Continued use of the service constitutes
                        acceptance of the updated terms.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

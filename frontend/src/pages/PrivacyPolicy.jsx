import {Box, Card, CardContent, CardHeader, Typography} from "@mui/material";

export default function PrivacyPolicy() {
    return (
        <Card elevation={0}>
            <CardHeader
                title="Privacy Policy"
                titleTypographyProps={{
                    fontWeight: "bold",
                    fontSize: 36,
                    color: "primary",
                    textAlign: "center",
                }}
                sx={{paddingBottom: 2}}
            />
            <CardContent>
                <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                    <Typography>
                        We value the privacy of our users and their families. Our platform is designed
                        exclusively for family members to connect, share posts, messages, and calendar events.
                    </Typography>

                    <Typography variant="h6">Information We Collect</Typography>
                    <Typography>
                        When you sign in using Google or Facebook, we collect your name, email address, and profile
                        picture. This information is used solely to create and manage your user account on our
                        platform.
                    </Typography>

                    <Typography variant="h6">How We Use Your Information</Typography>
                    <Typography>
                        We use your information to:
                        <ul>
                            <li>Authenticate your account</li>
                            <li>Allow you to create or join your family group</li>
                            <li>Enable sharing of posts, messages, and calendar events with your family</li>
                        </ul>
                        We do not share or sell your personal data to third parties.
                    </Typography>

                    <Typography variant="h6">Data Protection</Typography>
                    <Typography>
                        We use secure servers and encryption to protect your information. Only authorized
                        personnel can access your data.
                    </Typography>

                    <Typography variant="h6">Contact</Typography>
                    <Typography>
                        If you have any questions about this Privacy Policy, contact us at:
                        <strong> support@familyarbore.com</strong>.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

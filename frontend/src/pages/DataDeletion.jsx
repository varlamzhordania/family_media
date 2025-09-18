import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

export default function DataDeletion() {
    return (
        <Card elevation={0}>
            <CardHeader
                title="User Data Deletion Instructions"
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
                        If you have created an account on our family platform using Facebook or Google and
                        wish to delete your account and all related data, follow the steps below.
                    </Typography>

                    <Typography variant="h6">How to Request Deletion</Typography>
                    <Typography>
                        1. Email us at <strong>support@familyarbore.com</strong> with the subject line
                        <em> "Account Deletion Request"</em>.<br/>
                        2. Include the email address associated with your account.<br/>
                        3. Our support team will verify your identity and permanently delete your account and
                        all associated data within 7 days.
                    </Typography>

                    <Typography variant="h6">Important</Typography>
                    <Typography>
                        Once deleted, your account and all your posts, messages, and calendar events will be
                        permanently removed and cannot be recovered.
                    </Typography>

                    <Typography>
                        If you have any questions, contact us at <strong>support@familyarbore.com</strong>.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

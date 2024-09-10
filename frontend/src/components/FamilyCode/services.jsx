import {AlternateEmail, Sms, Telegram, WhatsApp} from "@mui/icons-material";

export const Services = [
    {
        label: "Email",
        value: "email",
        icon:<AlternateEmail color={"action"}/>,
        inputLabel: "Email",
        inputType: "email",
        inputPlaceholder: "Write your family email here...",
    },
    {
        label: "SMS",
        value: "sms",
        icon:<Sms color={"action"}/>,
        inputLabel: "Phone Number",
        inputType: "tel",
        inputPlaceholder: "Enter your family phone number...",
    },
    {
        label: "Telegram",
        value: "telegram",
        icon:<Telegram color={"action"}/>,
        inputLabel: "Telegram Username",
        inputType: "text",
        inputPlaceholder: "Enter your family Telegram username...",
    },
    {
        label: "WhatsApp",
        value: "whatsapp",
        icon:<WhatsApp color={"action"}/>,
        inputLabel: "WhatsApp Number",
        inputType: "tel",
        inputPlaceholder: "Enter your family WhatsApp number...",
    },
];

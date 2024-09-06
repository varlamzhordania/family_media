import {ACCESS_TOKEN_KEY} from "@lib/hooks/useToken.jsx";
import toast from "react-hot-toast";

export const getHeaders = (type = "json") => {
    const token = JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY))
    let content;
    switch (type) {
        case "json":
            content = "application/json";
            break;
        case "multipart":
            content = "multipart/form-data";
            break;
        case "none":
            content = null;
            break;
        default:
            content = "application/json";
            break;
    }

    const structure = {
        "Accept": "application/json",
    }
    if (content)
        structure["Content-Type"] = content

    if (token)
        structure["Authorization"] = `Bearer ${token}`

    return structure
}

export const handleError = (error) => {
    if (!error) {
        toast.error("An unknown error occurred.");
        return;
    }

    if (typeof error === 'string') {
        // Single string message
        toast.error(error, {duration: 10000});
        return;
    }

    if (Array.isArray(error)) {
        // List of errors
        error.forEach(message => toast.error(message, {duration: 10000}));
        return;
    }

    if (typeof error === 'object') {
        // Object of errors with lists of messages
        for (const key in error) {
            if (Array.isArray(error[key])) {
                error[key].forEach(message => toast.error(`${key} :\n ${message}`, {duration: 10000}));
            } else {
                toast.error(error[key], {duration: 10000});
            }
        }
        return;
    }

    toast.error("An unknown error occurred.");
};
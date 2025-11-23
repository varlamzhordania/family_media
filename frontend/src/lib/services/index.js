import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY} from "@lib/hooks/useToken.jsx";
import toast from "react-hot-toast";
import {CLIENT_ID, CLIENT_SECRET, END_POINTS} from "@src/conf/index.js";

// Read tokens from localStorage
const getAccessToken = () => JSON.parse(localStorage.getItem(ACCESS_TOKEN_KEY));
const getRefreshToken = () => JSON.parse(localStorage.getItem(REFRESH_TOKEN_KEY));

// Write tokens to localStorage
const setAccessToken = (token) => localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(token));
const setRefreshToken = (token) => localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(token));

/**
 * Service-layer fetch wrapper with:
 * - Authorization header
 * - Auto refresh on 401
 * - Django validation error parsing
 * - Toast error messages
 */
export const fetchWithAuth = async (
    url,
    {
        method = "GET",
        body = null,
        headers = {},
        retry = true,
    } = {}
) => {

    const finalHeaders = {
        ...headers, // start with user headers
    };

    const isFormData = body instanceof FormData;

    // Only set JSON header if NOT formData
    if (!isFormData) {
        finalHeaders["Content-Type"] = "application/json";
    }

    const token = getAccessToken();
    if (token) {
        finalHeaders["Authorization"] = `Bearer ${token}`;
    }

    let response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: isFormData ? body : body ? JSON.stringify(body) : null,
    });

    // ---- Auto Refresh Token ----
    if (response.status === 401 && retry) {

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            toast.error("Session expired. Please log in again.");
            throw {status: 401, detail: "Unauthorized"};
        }

        const refreshResponse = await fetch(END_POINTS.auth.refresh, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
        });

        if (!refreshResponse.ok) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            throw {status: 401, detail: "Unauthorized"};
        }

        const data = await refreshResponse.json();
        setAccessToken(data.access_token);
        if (data.refresh_token) setRefreshToken(data.refresh_token);

        return await fetchWithAuth(url, {
            method,
            body,
            headers,
            retry: false,
        });
    }

    // ---- Parse JSON ----
    let responseData;
    try {
        responseData = await response.json();
    } catch {
        responseData = null;
    }

    // ---- Error Handling ----
    if (!response.ok) {
        if (responseData) {
            if (responseData.detail) toast.error(responseData.detail);

            for (const [field, errs] of Object.entries(responseData)) {
                if (Array.isArray(errs)) {
                    errs.forEach(err => toast.error(`${field}: ${err}`));
                }
            }
        }
        throw responseData || {detail: "Unknown error"};
    }

    return responseData;
};

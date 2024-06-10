import {API_BASE_URL, CLIENT_ID, CLIENT_SECRET} from "../conf/index.js";
import {setToken} from "../features/utils/token.js";

export const loginService = async (data) => {
    const prepData = {
        grant_type: "password",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: data.email,
        password: data.password,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(prepData),
        });

        if (response.ok) {
            const responseData = await response.json();
            setToken(responseData.access_token, responseData.refresh_token)
            return responseData;
        } else {
            const errorData = await response.json();
            console.error("Login failed:", errorData);
            throw new Error(errorData.error_description || "Login failed");
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
};

import {
    CLIENT_ID,
    CLIENT_SECRET,
    END_POINTS,
    SOCIAL_GOOGLE_CLIENT_ID,
    SOCIAL_GOOGLE_CLIENT_SECRET
} from "../../conf/index.js";


export const loginService = async (data) => {
    const prepData = {
        grant_type: "password",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: data.email,
        password: data.password,
    };

    try {
        const response = await fetch(END_POINTS.auth.login, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(prepData),
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error;
    }
};

export const createService = async (data) => {
    try {
        const response = await fetch(END_POINTS.accounts.createUser, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: data,
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error;
    }
};

export const passwordResetService = async (data) => {
    try {
        const response = await fetch(END_POINTS.accounts.passwordReset, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: data,
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error;
    }
};

export const passwordResetConfirmService = async (data) => {
    try {
        const response = await fetch(END_POINTS.accounts.passwordResetConfirm, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: data,
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error;
    }
};


export const googleLoginService = async (token) => {
    const prepData = {
        grant_type: 'convert_token',
        client_id: SOCIAL_GOOGLE_CLIENT_ID,
        client_secret: SOCIAL_GOOGLE_CLIENT_SECRET,
        backend: 'google-oauth2',
        token: token,
    };

    try {
        const response = await fetch(END_POINTS.auth.convert, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(prepData),
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error;
    }
}

export const facebookLoginService = async (token) => {
    const prepData = {
        grant_type: 'convert_token',
        client_id: SOCIAL_FACEBOOK_CLIENT_ID,
        client_secret: SOCIAL_FACEBOOK_CLIENT_SECRET,
        backend: 'facebook',
        token: token,
    };

    try {
        const response = await fetch(END_POINTS.auth.convert, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(prepData),
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error;
    }
}
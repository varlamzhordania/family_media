import {CLIENT_ID, CLIENT_SECRET, END_POINTS} from "../../conf/index.js";


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
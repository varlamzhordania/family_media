import {END_POINTS} from "@src/conf/index.js";
import {getHeaders} from "@lib/utils/service.js";

export const createService = async (data) => {
    try {
        const response = await fetch(END_POINTS.chat.index, {
            method: "POST",
            headers: getHeaders("none"),
            body: data
        })
        if (response.ok) {
            return await response.json()
        } else {
            throw await response.json()
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error
    }
}

export const createLiveKitTokenService = async (data) => {
    try {
        const response = await fetch(END_POINTS.chat.livekit.token, {
            method: "POST",
            headers: getHeaders("json"),
            body: data
        })
        if (response.ok) {
            return await response.json()
        } else {
            throw await response.json()
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error
    }
}
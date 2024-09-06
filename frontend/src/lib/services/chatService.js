import {API_BASE_URL} from "@src/conf/index.js";
import {getHeaders} from "@lib/utils/service.js";

export const createService = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/`, {
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
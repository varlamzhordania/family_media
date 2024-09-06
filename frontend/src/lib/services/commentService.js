import {API_BASE_URL} from "../../conf/index.js";
import {getHeaders} from "../utils/service.js";


export const listService = async (id = null) => {
    if (id === null) {
        return null
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/comments/?post=${id}`, {
            method: "GET",
            headers: getHeaders(),
        })
        if (response.ok) {
            return await response.json()
        } else {
            const errorData = await response.json();
            throw new Error("failed to fetch posts", errorData)
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error
    }
}

export const createService = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/comments/`, {
            method: "POST",
            headers: getHeaders(),
            body: data
        })
        if (response.ok) {
            return await response.json()
        } else {
            const errorData = await response.json();
            console.log(errorData)
            throw new Error("failed to fetch posts", errorData)
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error
    }
}


export const likeService = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/posts/comments/like/`, {
            method: "POST",
            headers: getHeaders(),
            body: data
        })
        if (response.ok) {
            return await response.json()
        } else {
            const errorData = await response.json();
            console.log(errorData)
            throw new Error("failed to do like operation", errorData?.details)
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error
    }
}
import {END_POINTS} from "../../conf/index.js";
import {getHeaders} from "../utils/service.js";


export const listService = async (family = null) => {
    let url = END_POINTS.posts.index
    if (family)
        url += `?family=${family}`
    try {
        const response = await fetch(url, {
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
        const response = await fetch(END_POINTS.posts.index, {
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


export const likeService = async (data) => {
    try {
        const response = await fetch(END_POINTS.posts.like, {
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
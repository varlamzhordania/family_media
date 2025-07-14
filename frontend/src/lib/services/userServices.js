import {END_POINTS} from "@src/conf/index.js";
import {getHeaders} from "@lib/utils/service.js";


export const userService = async () => {
    try {
        const response = await fetch(END_POINTS.accounts.user, {
            method: "GET",
            headers: getHeaders(),
        })
        if (response.ok) {
            const {user, memberships, friends} = await response.json()
            return [user, memberships, friends]
        } else {
            throw await response.json()
        }

    } catch (error) {
        throw error;
    }
}
export const userPatchService = async (data, type = "json") => {
    try {
        const response = await fetch(END_POINTS.accounts.user, {
            method: "PATCH",
            headers: getHeaders(type),
            body: data
        })
        if (response.ok) {
            return await response.json()
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error
    }
}

export const relationListService = async (type = "json") => {
    try {
        const response = await fetch(END_POINTS.accounts.relations, {
            method: "GET",
            headers: getHeaders(type),
        })
        if (response.ok) {
            return await response.json()
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error
    }
}

export const relationUpdateOrCreateService = async (data, id = 0, type = "json") => {
    try {
        const response = await fetch(END_POINTS.accounts.relationsByID(id), {
            method: "PATCH",
            headers: getHeaders(type),
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


export const friendshipsListService = async (type = "json") => {
    try {
        const response = await fetch(END_POINTS.accounts.friendShipsRequests, {
            method: "GET",
            headers: getHeaders(type),
        })
        if (response.ok) {
            return await response.json()
        } else {
            throw await response.json()
        }
    } catch (error) {
        throw error
    }
}

export const friendshipsSendRequestService = async (data, id = 0, type = "json") => {

    try {
        const response = await fetch(END_POINTS.accounts.friendShipsRequestsByID(id), {
            method: "POST",
            headers: getHeaders(type),
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
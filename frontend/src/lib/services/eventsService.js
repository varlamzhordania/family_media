import {END_POINTS} from "@src/conf/index.js";
import {getHeaders} from "@lib/utils/service.js";

export const listService = async (id = null) => {
    let url = END_POINTS.events.index
    if (id)
        url += `?family=${id}`

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
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

export const createService = async (data, type = "json") => {
    let url = END_POINTS.events.index

    try {
        const response = await fetch(url, {
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

export const patchService = async (data, id, type = "json") => {
    let url = END_POINTS.events.byID(id)

    try {
        const response = await fetch(url, {
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
export const deleteService = async (id, type = "json") => {
    let url = END_POINTS.events.byID(id)

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: getHeaders(type),
        })
        if (response.ok) {
            return true
        } else {
            throw await response.json()
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error
    }
}


export const sendInvitationService = async (data, type = "json") => {
    let url = END_POINTS.events.invitation

    try {
        const response = await fetch(url, {
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
        throw error
    }
}
export const checkInvitationService = async (code) => {
    let url = `${END_POINTS.events.invitation}?code=${code}`

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: getHeaders(),
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


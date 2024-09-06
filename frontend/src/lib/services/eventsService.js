import {API_BASE_URL} from "@src/conf/index.js";
import {getHeaders} from "@lib/utils/service.js";

export const listService = async (id = null) => {
    let url = `${API_BASE_URL}/api/events/`
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
    let url = `${API_BASE_URL}/api/events/`

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
    let url = `${API_BASE_URL}/api/events/${id}/`

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
    let url = `${API_BASE_URL}/api/events/${id}/`

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
    let url = `${API_BASE_URL}/api/events/invitations/`

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
    let url = `${API_BASE_URL}/api/events/invitations/?code=${code}`

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


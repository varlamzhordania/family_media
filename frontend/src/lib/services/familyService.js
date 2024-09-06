import {API_BASE_URL} from "@src/conf/index.js";
import {getHeaders} from "@lib/utils/service.js";


export const createService = async (data, type = "json") => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/family/`, {
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

export const listService = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/`, {
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
export const retrieveService = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/${id}/`, {
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

export const patchService = async (data, type = "json", id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/${id}/`, {
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

export const joinService = async (data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/`, {
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

export const leaveService = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/${id}/`, {
            method: "DELETE",
            headers: getHeaders(),
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

export const requestInviteCodeService = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/invite/${id}/`, {
            method: "GET",
            headers: getHeaders("json"),
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
export const groupService = async (id, data) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/groups/${id}/`, {
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


export const treeListService = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/tree/${id}/`, {
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

export const treeCreateService = async (data, id, type = "none") => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/tree/${id}/`, {
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

export const treePatchService = async (data, id, type = "none") => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/tree/${id}/`, {
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

export const treeDeleteService = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/families/tree/${id}/`, {
            method: "DELETE",
            headers: getHeaders(),
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
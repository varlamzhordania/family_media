import {END_POINTS} from "@src/conf/index.js";
import {fetchWithAuth} from "@lib/services/index.js";


export const createService = async (data) => {
    return await fetchWithAuth(END_POINTS.family.index, {
        method: "POST",
        body: data
    })
}

export const listService = async () => {
    return await fetchWithAuth(END_POINTS.family.families, {
        method: "GET",
    })
}
export const retrieveService = async (id) => {
    return await fetchWithAuth(END_POINTS.family.familiesByID(id), {
        method: "GET",
    })
}

export const patchService = async (data, id) => {
    return await fetchWithAuth(END_POINTS.family.familiesByID(id), {
        method: "PATCH",
        body: data
    })
}

export const joinService = async (data) => {
    return  await fetchWithAuth(END_POINTS.family.families, {
        method: "POST",
        body: data
    })
}

export const leaveService = async (id) => {
    return await fetchWithAuth(END_POINTS.family.familiesByID(id), {
        method: "DELETE",
    })
}

export const requestInviteCodeService = async (id) => {
    return  await fetchWithAuth(END_POINTS.family.familiesInviteByID(id), {
        method: "GET",
    })
}
export const groupService = async (id, data) => {
    return  await fetchWithAuth(END_POINTS.family.familiesGroupsByID(id), {
        method: "POST",
        body: data
    })
}


export const treeListService = async (id) => {
    return  await fetchWithAuth(END_POINTS.family.familiesTreeByID(id), {
        method: "GET",
    })
}

export const treeCreateService = async (data, id) => {
    return  await fetchWithAuth(END_POINTS.family.familiesTreeByID(id), {
        method: "POST",
        body: data
    })
}

export const treePatchService = async (data, id) => {
    return  await fetchWithAuth(END_POINTS.family.familiesTreeByID(id), {
        method: "PATCH",
        body: data
    })
}

export const treeDeleteService = async (id) => {
    return await fetchWithAuth(END_POINTS.family.familiesTreeByID(id), {
        method: "DELETE",
    })
}
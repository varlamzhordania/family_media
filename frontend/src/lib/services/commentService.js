import {END_POINTS} from "../../conf/index.js";
import {fetchWithAuth} from "@lib/services/index.js";


export const listService = async (id = null) => {
    if (id === null) {
        return null
    }
    return await fetchWithAuth(END_POINTS.posts.commentsByPostID(id), {
        method: "GET",
    })

}

export const createService = async (data) => {
    return await fetchWithAuth(END_POINTS.posts.comments, {
        method: "POST",
        body: data
    })
}


export const likeService = async (data) => {
    return  await fetchWithAuth(END_POINTS.posts.commentsLike, {
        method: "POST",
        body: data
    })
}
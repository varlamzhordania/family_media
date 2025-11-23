const DEBUG = import.meta.env.MODE === 'development'

export const API_SERVER_DOMAIN = import.meta.env.VITE_API_SERVER_DOMAIN
export const WS_SERVER_DOMAIN = import.meta.env.VITE_WS_SERVER_DOMAIN

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID
export const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET

export const SOCIAL_GOOGLE_CLIENT_ID = import.meta.env.VITE_SOCIAL_GOOGLE_CLIENT_ID
export const SOCIAL_GOOGLE_CLIENT_SECRET = import.meta.env.VITE_SOCIAL_GOOGLE_CLIENT_SECRET

export const SOCIAL_FACEBOOK_CLIENT_ID = import.meta.env.VITE_SOCIAL_FACEBOOK_CLIENT_ID
export const SOCIAL_FACEBOOK_CLIENT_SECRET = import.meta.env.VITE_SOCIAL_FACEBOOK_CLIENT_SECRET

export const SOCIAL_GOOGLE_PUBLIC_KEY = import.meta.env.VITE_SOCIAL_GOOGLE_PUBLIC_KEY
export const SOCIAL_FACEBOOK_PUBLIC_KEY = import.meta.env.VITE_SOCIAL_FACEBOOK_PUBLIC_KEY

export const API_BASE_URL = DEBUG ? `http://${API_SERVER_DOMAIN}` : `https://${API_SERVER_DOMAIN}`
export const SOCKET_BASE_URL = DEBUG ? `ws://${WS_SERVER_DOMAIN}` : `wss://${WS_SERVER_DOMAIN}`

export const END_POINTS = {
    auth: {
        login: `${API_BASE_URL}/api/auth/token/`,
        convert: `${API_BASE_URL}/api/auth/convert-token/`,
        refresh: `${API_BASE_URL}/api/auth/token/`,
    },
    accounts: {
        user: `${API_BASE_URL}/api/v1/accounts/user/`,
        createUser: `${API_BASE_URL}/api/v1/accounts/user/register/`,
        passwordReset: `${API_BASE_URL}/api/v1/accounts/user/password-reset/`,
        passwordResetConfirm: `${API_BASE_URL}/api/v1/accounts/user/password-reset-confirm/`,
        relations: `${API_BASE_URL}/api/v1/accounts/user/relations/`,
        relationsByID: (id) => `${API_BASE_URL}/api/v1/accounts/user/relations/${id}/`,
        friendShipsRequests: `${API_BASE_URL}/api/v1/accounts/user/friend-requests/`,
        friendShipsRequestsByID: (id) => `${API_BASE_URL}/api/v1/accounts/user/friend-requests/${id}/`,
    },
    posts: {
        index: `${API_BASE_URL}/api/v1/posts/`,
        like: `${API_BASE_URL}/api/v1/posts/like/`,
        comments: `${API_BASE_URL}/api/v1/posts/comments/`,
        commentsByPostID: (id) => `${API_BASE_URL}/api/v1/posts/comments/?post=${id}`,
        commentsLike: `${API_BASE_URL}/api/v1/posts/comments/like/`,
    },
    events: {
        index: `${API_BASE_URL}/api/v1/events/`,
        byID: (id) => `${API_BASE_URL}/api/v1/events/${id}/`,
        invitation: `${API_BASE_URL}/api/v1/events/invitations/`,
    },
    family: {
        index: `${API_BASE_URL}/api/v1/family/`,
        families: `${API_BASE_URL}/api/v1/families/`,
        familiesByID: (id) => `${API_BASE_URL}/api/v1/families/${id}/`,
        familiesInviteByID: (id) => `${API_BASE_URL}/api/v1/families/invite/${id}/`,
        familiesGroupsByID: (id) => `${API_BASE_URL}/api/v1/families/groups/${id}/`,
        familiesTreeByID: (id) => `${API_BASE_URL}/api/v1/families/tree/${id}/`,

    },
    chat: {
        index: `${API_BASE_URL}/api/v1/chat/`,
        livekit: {
            token: `${API_BASE_URL}/api/v1/chat/livekit/token/`,
        },
        room: {
            createGroup: `${API_BASE_URL}/api/v1/chat/groups/`,
            updateGroup: (id) => `${API_BASE_URL}/api/v1/chat/groups/${id}/`,
        }
    }
}
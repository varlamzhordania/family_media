export const DEBUG = true

export const API_SERVER_DOMAIN = '127.0.0.1:8000'
export const WS_SERVER_DOMAIN = '127.0.0.1:8000'

export const CLIENT_ID = '1xLf2JHl9N5fGk6p409HAqHzAHcyGwiqXVQh7XE5'
export const CLIENT_SECRET = 'S8ZKQgCE4o3qmOslqyRfgjJLg1djzOyZtF4xVXiszNI6l9JKbf25PlG7ABPKCZzcAHPUHgc0dOmTncZ6hssiixdcdy9iKZ94yvtdiFGUBQRJHgro51eae47KC6nn8qAr'

export const API_BASE_URL = DEBUG ? `http://${API_SERVER_DOMAIN}` : `https://${API_SERVER_DOMAIN}`
export const SOCKET_BASE_URL = DEBUG ? `ws://${WS_SERVER_DOMAIN}` : `wss://${WS_SERVER_DOMAIN}`


export const END_POINTS = {
    auth: {
        login: `${API_BASE_URL}/api/auth/token/`,


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
        index: `${API_BASE_URL}/api/v1/chat/`
    }
}
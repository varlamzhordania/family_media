export const DEBUG = true

export const SERVER_DOMAIN = '127.0.0.1:8000'

export const CLIENT_ID = 'bg6TLdFUwS0OFxRUxXWFwVD1o2MZ1wa9QIu7fnYY'
export const CLIENT_SECRET = 'O9QHRLQwmn9Nma3MgOWuCl97mFSdM4GhY2Ddu8NOOlNwWql3jtMcJYcRjwa412yc9wcbgVFyvk93tNvLqYELYRf0eDG5Tzhep5mZvDL185xHJ4H7EeQA8JGYYRexvtyD'

export const API_BASE_URL = DEBUG ? `http://${SERVER_DOMAIN}` : `https://${SERVER_DOMAIN}`

export const SOCKET_BASE_URL = DEBUG ? `ws://${SERVER_DOMAIN}` : `wss://${SERVER_DOMAIN}`
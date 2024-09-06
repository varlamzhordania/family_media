import useLocalStorage from '@lib/hooks/useLocalStorage.jsx';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// Hook functions for tokens
export const useAccessToken = () => {
    return useLocalStorage(ACCESS_TOKEN_KEY, null);
};

export const useRefreshToken = () => {
    return useLocalStorage(REFRESH_TOKEN_KEY, null);
};

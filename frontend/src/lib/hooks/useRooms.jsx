import useLocalStorage from '@lib/hooks/useLocalStorage.jsx';

export const ROOMS_KEY = 'rooms';

// Hook functions for tokens
export const useRooms = () => {
    return useLocalStorage(ROOMS_KEY, null);
};

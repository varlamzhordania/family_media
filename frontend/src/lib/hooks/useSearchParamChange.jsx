import {useLocation} from 'react-router-dom';
import {useState, useEffect} from 'react';

export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const useSearchParamChange = (param) => {
    const query = useQuery();
    const [value, setValue] = useState(query.get(param));

    useEffect(() => {
        const handleSearchParamChange = () => {
            const newValue = query.get(param);
            if (newValue !== value) {
                setValue(newValue);
            }
        };

        handleSearchParamChange();
        window.addEventListener('popstate', handleSearchParamChange);
        return () => {
            window.removeEventListener('popstate', handleSearchParamChange);
        };
    }, [param, value, query]);

    return value;
};

export default useSearchParamChange;

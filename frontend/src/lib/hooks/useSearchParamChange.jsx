import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const useSearchParamChange = (param) => {
    const location = useLocation();
    const [value, setValue] = useState(() => {
        const query = new URLSearchParams(location.search);
        return query.get(param);
    });

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        setValue(query.get(param));
    }, [location.search, param]);

    return value;
};

export default useSearchParamChange;

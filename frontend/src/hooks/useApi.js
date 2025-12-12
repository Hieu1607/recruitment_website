/**
 * Custom Hook: useApi
 * Custom hook for making API calls with loading and error states
 */

import { useState, useEffect } from 'react';

export const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add API hook logic here

    return { data, loading, error };
};


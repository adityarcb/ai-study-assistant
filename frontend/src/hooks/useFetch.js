import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(url, options);
      setData(res.data);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Request failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

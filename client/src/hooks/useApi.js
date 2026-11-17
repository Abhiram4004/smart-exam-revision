import { useState, useCallback } from 'react';
import api from '../services/api';

export default function useApi(url, method = 'get') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (body = null, queryParams = null) => {
      setLoading(true);
      setError(null);
      try {
        let finalUrl = url;
        if (queryParams) {
          const params = new URLSearchParams(queryParams).toString();
          finalUrl = `${url}?${params}`;
        }
        let response;
        if (method === 'get' || method === 'delete') {
          response = await api[method](finalUrl);
        } else {
          response = await api[method](finalUrl, body);
        }
        setData(response.data);
        return response.data;
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Something went wrong';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return { data, loading, error, execute };
}

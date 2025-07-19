"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useFetch(endpoint, queryKey, id = null, options = {}) {
  const queryClient = useQueryClient();

  const fetchData = async () => {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    return res.json();
  };

  const query = useQuery({
    queryKey,
    queryFn: fetchData,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    ...options,
  });

  const mutate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return { ...query, mutate };
}

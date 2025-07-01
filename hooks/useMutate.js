import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMutate(endpoint, queryKey, options = {}) {
  const queryClient = useQueryClient();
  const {
    method = 'POST',
    headers = {},
    ...mutationOptions
  } = options;

  const mutationFn = async (body) => {
    const isFormData = body instanceof FormData;

    const res = await fetch(endpoint, {
      method,
      headers: isFormData ? {} : headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Mutation failed');
    }
    return res.json();
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    ...mutationOptions,
  });

  return {
    ...mutation,
    execute: mutation.mutate,
    executeAsync: mutation.mutateAsync,
  };
}

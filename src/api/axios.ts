import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const API_URL = import.meta.env.VITE_API_HOST;

export const client = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

export const request = async <T = unknown>(
  options: AxiosRequestConfig,
  errorsMessages?: Record<number, string>,
  nativeErrors?: number[],
): Promise<T> => {
  const onSuccess = (response: AxiosResponse<T>) => {
    return response.data;
  };

  const onError = (error: AxiosError) => {
    console.log("error in ax", error);
    if (error.response) {
      const status = error.response.status;

      if (nativeErrors?.includes(status)) {
        throw error;
      }

      if (errorsMessages?.[status]) {
        throw new Error(errorsMessages[status]);
      }

      // Иначе пробрасываем стандартное сообщение
      throw new Error(
        (error.response.data as any)?.detail ||
          `Request failed with status ${status}`,
      );
    }

    // Ошибка без ответа (например, сеть)
    throw new Error(error.message || "Network Error");
  };

  return client(options).then(onSuccess).catch(onError);
};

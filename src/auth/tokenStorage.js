const ACCESS_TOKEN_KEY = "accessToken";

export const getStoredAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const setStoredAccessToken = (accessToken) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

export const clearStoredAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const hasStoredAccessToken = () => Boolean(getStoredAccessToken());


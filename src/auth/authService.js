let authService = null;

export const registerAuthService = (service) => {
  authService = service;
};

export const clearAuthService = () => {
  authService = null;
};

export const getAuthService = () => authService;


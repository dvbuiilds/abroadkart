export const apiPaths = {
  development: "http://localhost:3000",
  production: "https://my-production-api.com",
};

export const apiEndPoints = {
  login: "/api/auth/login",
  signup: "/api/auth/signup",
  session: "/api/auth/db-session",
  logout: "/api/auth/logout",
  nextAuth: "/api/auth/[...nextauth]",
};

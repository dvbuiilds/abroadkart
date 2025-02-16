export const apiPaths = {
  development: "http://localhost:3000",
  production: "https://my-production-api.com",
};

export const apiEndPoints = {
  /**
   * @deprecated
   */
  login: "/api/auth/login",
  signup: "/api/auth/signup",
  /**
   * @deprecated
   */
  session: "/api/auth/db-session",
  /**
   * @deprecated
   */
  logout: "/api/auth/logout",
  nextAuth: "/api/auth/[...nextauth]",
  getUser: "/api/auth/get-user",
  preCounsellingForm: "/api/pre-counselling-form",
};

export const apiPaths = {
  development: "http://localhost:3000",
  production: "https://my-production-api.com",
};

export const apiPath =
  process.env.ENVIRONMENT === "production"
    ? apiPaths.production
    : apiPaths.development;

export const apiEndPoints = {
  signup: "/api/auth/signup",
  nextAuth: "/api/auth/[...nextauth]",
  getUser: "/api/auth/get-user",
  preCounsellingForm: "/api/pre-counselling-form",
};

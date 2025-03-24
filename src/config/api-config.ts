export const apiPaths = {
  development: "http://localhost:3000",
  preview: "https://abroadkart-git-integration-dvbuiilds-projects.vercel.app",
  production: "",
};

export const apiEndPoints =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? apiPaths.production
    : process.env.NEXT_PUBLIC_ENVIRONMENT === "preview"
    ? apiPaths.preview
    : apiPaths.development;

export const apiPath = {
  signup: "/api/auth/signup",
  nextAuth: "/api/auth/[...nextauth]",
  getUser: "/api/auth/get-user",
  preCounsellingForm: "/api/pre-counselling-form",
  getBlogData: "/api/blogs/get-blog",
  freeCounsellingForm: "/api/free-counselling-form",
};

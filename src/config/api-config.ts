export const apiPaths = {
  development: "http://localhost:3000",
  preview: "https://abroadkart-git-integration-dvbuiilds-projects.vercel.app",
  production: "",
};

export const apiPath =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? apiPaths.production
    : process.env.NEXT_PUBLIC_ENVIRONMENT === "preview"
    ? apiPaths.preview
    : apiPaths.development;

export const apiEndPoints = {
  signup: "/api/auth/signup",
  nextAuth: "/api/auth/[...nextauth]",
  getUser: "/api/auth/get-user",
  preCounsellingForm: "/api/pre-counselling-form",
  getBlogData: "/api/blogs/get-blog",
};

const apiEndPoints = {
  development: "http://localhost:3000",
  preview: "https://abroadkart-git-integration-dvbuiilds-projects.vercel.app",
  production: "https://app.abroadkart.com",
};

export const apiEndPoint =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "production"
    ? apiEndPoints.production
    : process.env.NEXT_PUBLIC_ENVIRONMENT === "preview"
    ? apiEndPoints.preview
    : apiEndPoints.development;

console.log(
  "@@ apiEndPoint: ",
  apiEndPoint,
  "VERCEL_ENV",
  process.env.VERCEL_ENV
);

export const apiPath = {
  signup: "/api/auth/signup",
  nextAuth: "/api/auth/[...nextauth]",
  getUser: "/api/auth/get-user",
  preCounsellingForm: "/api/pre-counselling-form",
  freeCounsellingForm: "/api/free-counselling-form",
  getBlogData: "/api/blogs/get-blog",
  getAllBlogs: "/api/blogs/get-all-blogs",
};

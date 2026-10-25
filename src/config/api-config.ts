const apiEndPoints = {
  development: "http://localhost:3000",
  preview:
    process.env.NEXT_PUBLIC_PREVIEW_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000",
  production: "https://app.abroadkart.com",
};

const ENV =
  process.env.NEXT_PUBLIC_ENVIRONMENT ||
  (process.env.NODE_ENV === "development" ? "development" : "production");

export const apiEndPoint =
  ENV === "production"
    ? apiEndPoints.production
    : ENV === "preview"
    ? apiEndPoints.preview
    : apiEndPoints.development;

export const apiPath = {
  signup: "/api/auth/signup",
  nextAuth: "/api/auth/[...nextauth]",
  getUser: "/api/auth/get-user",
  preCounsellingForm: "/api/pre-counselling-form",
  freeCounsellingForm: "/api/free-counselling-form",
  getBlogData: "/api/blogs/get-blog",
  getAllBlogs: "/api/blogs/get-all-blogs",
};

export const routesOnlyForLoggedInUsers = ["/dashboard", "/dashboard/*"];

export const checkIfRouteIsProtected = (pathname: string): boolean => {
  return routesOnlyForLoggedInUsers.some((route) => {
    // Convert wildcard (*) to a regex-compatible format
    const regex = new RegExp(`^${route.replace("*", ".*")}$`);
    return regex.test(pathname);
  });
};

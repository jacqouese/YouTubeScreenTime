export const routes = {};

const route = (path, action) => {
    return (routes[path] = action);
};

export default route;

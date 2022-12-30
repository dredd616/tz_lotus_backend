const services = {};

export const ServiceLocator = {
    get: (name) => services[name],
    set: (name, value) => {
        services[name] = value;
    },
};

import { v4 } from 'uuid';
import { ResponseError } from '../../utils/response.js';
import { ServiceLocator } from '../../utils/service-locator.js';

export const UserService = {
    createUser: (name) => {
        const db = ServiceLocator.get('db');
        const notUnique = db.data.users.find((user) => user.name === name);
        if (notUnique) {
            throw new ResponseError({ notifyMessage: 'Юзер с таким именем уже существует' });
        }

        const user = {
            id: v4(),
            name,
        };
        db.data.users.push(user);
        db.update();

        return user;
    },
    getAll: () => {
        const db = ServiceLocator.get('db');
        return db.data.users;
    },
    ensureUsersExist: async (userIDs) => {
        const db = ServiceLocator.get('db');
        const everyUserExist = userIDs.every((userId) =>
            db.data.users.find((user) => user.id === userId),
        );
        if (!everyUserExist) {
            throw new Error('Some of the provided users does not exist');
        }
    },
    byIDs: (userIDs) => {
        const db = ServiceLocator.get('db');
        return userIDs.map((userId) => db.data.users.find((user) => user.id === userId));
    },
};

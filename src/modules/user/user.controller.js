import { UserService } from './user.service.js';
import { createController, mapToResponseError, respond } from '../../utils/response.js';
import { CREATE_USER_SCHEMA_BODY } from './user.schema.js';

export const UserController = {
    createUser: createController(async (req, res) => {
        const { name } = await CREATE_USER_SCHEMA_BODY.validate(req.body).catch(
            mapToResponseError({
                notifyMessage: 'Невалидные данные. Имя пользователя обязательно',
            }),
        );

        const user = UserService.createUser(name);
        respond({ res, data: user });
    }),
    getAll: createController((req, res) => {
        const users = UserService.getAll();
        respond({ res, data: users });
    }),
};

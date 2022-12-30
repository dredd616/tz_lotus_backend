import { Router as ExpressRouter } from 'express';
import { UserController } from './user.controller.js';

export const UserRouter = ExpressRouter();

UserRouter.route('/users').post(UserController.createUser).get(UserController.getAll);

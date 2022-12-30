import { Router as ExpressRouter } from 'express';
import { PingPongController } from './ping-pong.controller.js';

const PingPongRouter = ExpressRouter();

PingPongRouter.route('/ping').get(PingPongController.ping);

export { PingPongRouter };

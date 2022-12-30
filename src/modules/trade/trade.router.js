import { Router as ExpressRouter } from 'express';
import { TradeController } from './trade.controller.js';

export const TradeRouter = ExpressRouter();

TradeRouter.route('/trades').post(TradeController.createTrade).get(TradeController.getAll);
TradeRouter.route('/trades/subscribe/:id').get(TradeController.subscribe);
TradeRouter.route('/trades/:id').get(TradeController.get);

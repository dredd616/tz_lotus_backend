import { TradeService } from './trade.service.js';
import { UserService } from '../user/user.service.js';
import { createController, mapToResponseError, respond } from '../../utils/response.js';
import { CREATE_TRADE_SCHEMA_BODY } from './trade.schema.js';
import { TradeTimerWorker } from './trade-timer.worker.js';

export const TradeController = {
    createTrade: createController(async (req, res) => {
        const { userIDs, name, dateEnd } = await CREATE_TRADE_SCHEMA_BODY.validate(req.body).catch(
            mapToResponseError({
                notifyMessage:
                    'Невалидные данные. Обязательно как минимум 2 пользователя, название, и дата окончания',
            }),
        );
        await UserService.ensureUsersExist(userIDs).catch(
            mapToResponseError({
                notifyMessage: 'Содержит несуществующих пользователей',
            }),
        );
        const trade = TradeService.createTrade({ userIDs, name, dateEnd });
        TradeTimerWorker.run(trade, {
            onChange: (tradeInfo) => {
                TradeService.updateTrade(trade.id, () => TradeService.sanitizeToDB(tradeInfo));
            },
            onOnce: (tradeInfo) => {
                TradeService.updateTrade(trade.id, () => TradeService.sanitizeToDB(tradeInfo));
            },
        });

        const users = UserService.byIDs(userIDs);
        respond({
            res,
            data: { ...trade, users },
        });
    }),
    get: createController(async (req, res) => {
        const trade = TradeService.get(req.params.id);
        const users = UserService.byIDs(trade.userIDs);
        const tradesWithUsers = {
            ...trade,
            users,
        };
        respond({ res, data: tradesWithUsers });
    }),
    subscribe: createController(async (req, res) => {
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        });

        res.flushHeaders();
        res.write('retry: 10000\n\n');

        const listener = (trade) => {
            const users = UserService.byIDs(trade.userIDs);
            const data = { ...trade, users };
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };
        const unsubscribe = TradeTimerWorker.subscribe(req.params.id, 'tick', listener, () =>
            res.end(),
        );

        res.on('close', unsubscribe);
    }),
    getAll: createController(async (req, res) => {
        const trades = TradeService.getAll();
        const tradesWithUsers = trades.map((trade) => {
            const users = UserService.byIDs(trade.userIDs);
            return {
                ...trade,
                users,
            };
        });

        respond({ res, data: tradesWithUsers });
    }),
};

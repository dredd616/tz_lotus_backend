import { v4 } from 'uuid';
import { ServiceLocator } from '../../utils/service-locator.js';
import { ResponseError } from '../../utils/response.js';
import { TradeTimerWorker } from './trade-timer.worker.js';

export const TradeService = {
    isTradeExpired: (trade) => {
        const currentDate = new Date().getTime();
        const endDate = new Date(trade.dateEnd).getTime();

        return currentDate >= endDate;
    },
    createTrade: ({ userIDs, dateEnd, name }) => {
        const db = ServiceLocator.get('db');
        const notUnique = db.data.trades.find((trade) => trade.name === name);
        if (notUnique) {
            throw new ResponseError({ notifyMessage: 'Трейд с таким именем уже существует' });
        }

        const currentDate = new Date().getTime();
        const endDate = new Date(dateEnd).getTime();

        const alreadyExpired = currentDate >= endDate;
        if (alreadyExpired) {
            throw new ResponseError({
                notifyMessage: 'Дата окончания больше должна быть больше текущей',
            });
        }

        const trade = {
            id: v4(),
            userIDs,
            dateEnd,
            name,
            winnerUserId: null,
            tradingUserId: userIDs[0],
        };

        db.data.trades.push(trade);
        db.update();
        return { ...trade, isExpired: TradeService.isTradeExpired(trade) };
    },
    updateTrade: (tradeId, callback) => {
        const db = ServiceLocator.get('db');
        const tradeIndex = db.data.trades.findIndex((trade) => trade.id === tradeId);
        if (tradeIndex === -1) {
            throw new Error('Trade not found');
        }
        db.data.trades[tradeIndex] = callback(db.data.trades[tradeIndex]);
        db.update();
    },
    getAll: () => {
        const db = ServiceLocator.get('db');
        return db.data.trades.map((trade) => ({
            ...trade,
            isExpired: TradeService.isTradeExpired(trade),
        }));
    },
    get: (tradeId) => {
        const db = ServiceLocator.get('db');
        const trade = db.data.trades.find((trade) => trade.id === tradeId);
        if (!trade) {
            throw new ResponseError({ notifyMessage: 'Трейд не найден' });
        }
        return {
            ...trade,
            isExpired: TradeService.isTradeExpired(trade),
        };
    },
    sanitizeToDB: (trade) => ({
        winnerUserId: trade.winnerUserId,
        tradingUserId: trade.tradingUserId,
        id: trade.id,
        name: trade.name,
        dateEnd: trade.dateEnd,
        userIDs: trade.userIDs,
    }),
    runNotExpiredTrades: () => {
        const db = ServiceLocator.get('db');
        const { trades } = db.data;

        const currentDate = new Date().getTime();

        const notExpiredTrades = trades.filter((trade) => {
            const endDate = new Date(trade.dateEnd).getTime();
            const alreadyExpired = currentDate >= endDate;
            return !alreadyExpired;
        });

        notExpiredTrades.forEach((trade) =>
            TradeTimerWorker.run(trade, {
                onChange: (tradeInfo) => {
                    TradeService.updateTrade(trade.id, () => TradeService.sanitizeToDB(tradeInfo));
                },
                onOnce: (tradeInfo) => {
                    TradeService.updateTrade(trade.id, () => TradeService.sanitizeToDB(tradeInfo));
                },
            }),
        );
    },
};

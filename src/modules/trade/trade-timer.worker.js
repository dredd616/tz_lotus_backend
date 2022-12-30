const CONFIG = {
    TICK_FREQUENCY: 1000,
    UPDATE_USER_FREQUENCY: 2 * 60 * 1000,
};

class TradeTimer {
    constructor(trade, onStop) {
        this.onStop = onStop;
        this.subscribers = {
            tick: [],
            change: [],
        };

        this.trade = trade;
        this.info = {
            prevUpdatedUserTime: new Date().getTime(),
            nextTurnTime: new Date().getTime() + CONFIG.UPDATE_USER_FREQUENCY,
            usersLength: this.trade.userIDs.length,
            winnerUserId: null,
            currentTradingUserIndex: 0,
            currentTradingUserId: this.trade.userIDs[0],
            timing: this.getTimingInfo(),
        };

        if (this.info.timing.isExpired) {
            onStop();
        }
        this.run();
    }

    updateTradingUser = () => {
        const shouldUpdate =
            new Date().getTime() > this.info.prevUpdatedUserTime + CONFIG.UPDATE_USER_FREQUENCY;
        if (!shouldUpdate) return;

        this.info.prevUpdatedUserTime = new Date().getTime();
        this.info.nextTurnTime = this.info.prevUpdatedUserTime + CONFIG.UPDATE_USER_FREQUENCY;
        this.info.currentTradingUserIndex++;
        if (this.info.currentTradingUserIndex >= this.info.usersLength) {
            this.info.currentTradingUserIndex = 0;
        }

        this.info.currentTradingUserId = this.trade.userIDs[this.info.currentTradingUserIndex];
        this.notifySubscribers('change');
    };

    notifySubscribers = (type) => {
        this.subscribers[type].forEach((cb) =>
            cb({
                ...this.trade,
                tradingUserId: this.info.currentTradingUserId,
                winnerUserId: this.info.winnerUserId,
                nextTurnTime: this.info.nextTurnTime,
                isExpired: this.info.timing.isExpired,
            }),
        );
    };

    makeWinner = () => {
        this.info.winnerUserId = this.info.currentTradingUserId;
        this.info.currentTradingUserId = null;
        this.info.currentTradingUserIndex = null;
    };

    run = () => {
        this.interval = setInterval(() => {
            this.updateTimingInfo();
            if (this.info.timing.isExpired) {
                this.makeWinner();
                this.notifySubscribers('change');
                this.stop();
            } else {
                this.updateTradingUser();
            }

            this.notifySubscribers('tick');
        }, CONFIG.TICK_FREQUENCY);
    };

    stop = () => {
        clearInterval(this.interval);
        this.onStop();
    };

    getTimingInfo = () => {
        const currentDate = new Date().getTime();
        const endDate = new Date(this.trade.dateEnd).getTime();

        const isExpired = currentDate >= endDate;
        return {
            currentDate,
            endDate,
            isExpired,
        };
    };

    updateTimingInfo = () => {
        this.info.timing = this.getTimingInfo();
    };

    subscribe = (cb, type) => {
        this.subscribers[type].push(cb);
        return () => {
            this.subscribers[type].splice(this.subscribers[type].indexOf(cb), 1);
        };
    };
}

const timers = {};

export const TradeTimerWorker = {
    run: (trade, {onChange, onTick, onOnce} = {}) => {
        if (!timers[trade.id]) {
            timers[trade.id] = new TradeTimer(trade, () => {
                delete timers[trade.id];
            });
            if (onChange) {
                timers[trade.id].subscribe(onChange, 'change');
            }
            if (onTick) {
                timers[trade.id].subscribe(onTick, 'tick');
            }
            if (onOnce) {
                onOnce({
                    ...timers[trade.id].trade,
                    tradingUserId: timers[trade.id].info.currentTradingUserId,
                    winnerUserId: timers[trade.id].info.winnerUserId,
                    nextTurnTime: timers[trade.id].info.nextTurnTime,
                });
            }
        }
    },
    subscribe: (tradeId, type, callback, onNotFound = () => undefined) => {
        if (timers[tradeId]) {
            return timers[tradeId].subscribe(callback, type);
        }

        onNotFound();
        return onNotFound;
    },
};

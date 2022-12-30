import { ServiceLocator } from '../../utils/service-locator.js';

export const PingPongService = {
    ping: () => {
        const db = ServiceLocator.get('db');
        return { message: 'pong', db: db.data };
    },
};

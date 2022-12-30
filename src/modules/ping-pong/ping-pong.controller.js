import { PingPongService } from './ping-pong.service.js';

export const PingPongController = {
    ping: (req, res) => {
        res.json(PingPongService.ping());
    },
};

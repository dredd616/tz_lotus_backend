import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { resolve } from './utils/dirname.js';
import { initLowDB } from './db/index.js';
import { PingPongRouter } from './modules/ping-pong/ping-pong.router.js';
import { UserRouter } from './modules/user/user.router.js';
import { TradeRouter } from './modules/trade/trade.router.js';
import { ServiceLocator } from './utils/service-locator.js';
import { TradeService } from './modules/trade/trade.service.js';

dotenv.config({ path: resolve(import.meta.url, '..', '.env') });

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const db = await initLowDB();
ServiceLocator.set('db', db);

// app.use((req, res, next) => setInterval(next, 500));

app.use('/api', PingPongRouter);
app.use('/api', UserRouter);
app.use('/api', TradeRouter);

TradeService.runNotExpiredTrades();

app.listen(process.env.PORT, () => console.log('BACKEND IS RUNNING ON PORT', process.env.PORT));

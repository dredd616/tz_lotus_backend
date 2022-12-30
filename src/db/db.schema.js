import * as Yup from 'yup';
import { USER_SCHEMA_DB } from '../modules/user/user.schema.js';
import { TRADE_DB_SCHEMA } from '../modules/trade/trade.schema.js';

const DBSchema = Yup.object().shape({
    users: Yup.array().of(USER_SCHEMA_DB).required(),
    trades: Yup.array().of(TRADE_DB_SCHEMA).required(),
});

export { DBSchema };

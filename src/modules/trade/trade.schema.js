import * as Yup from 'yup';

export const CREATE_TRADE_SCHEMA_BODY = Yup.object().shape({
    userIDs: Yup.array().min(2).of(Yup.string().required()).required(),
    dateEnd: Yup.date().required(),
    name: Yup.string().required(),
});

export const TRADE_DB_SCHEMA = Yup.object().shape({
    userIDs: Yup.array().of(Yup.string().required()).required(),
    dateEnd: Yup.date().required(),
    name: Yup.string().required(),
    id: Yup.string().required(),
    tradingUserId: Yup.string().nullable(),
    winnerUserId: Yup.string().nullable(),
});

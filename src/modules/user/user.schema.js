import * as Yup from 'yup';

export const CREATE_USER_SCHEMA_BODY = Yup.object().shape({
    name: Yup.string().required(),
});

export const USER_SCHEMA_DB = Yup.object().shape({
    name: Yup.string().required(),
    id: Yup.string().required(),
});

const RESPONSE = {
    OK: 'OK',
    BAD: 'BAD',
};

const RESPONSE_TO_CODE = {
    [RESPONSE.OK]: 200,
    [RESPONSE.BAD]: 400,
};

const RESPONSE_TO_KIND = {
    [RESPONSE.OK]: 'success',
    [RESPONSE.BAD]: 'error',
};

const respond = ({ res, message, notifyMessage, data = null, response = RESPONSE.OK }) => {
    res.status(RESPONSE_TO_CODE[response]).json({
        data,
        status: {
            message,
            notifyMessage,
            kind: RESPONSE_TO_KIND[response],
        },
    });
};

class ResponseError extends Error {
    constructor({ message, notifyMessage, response = RESPONSE.BAD }) {
        super(message);
        this.responseMessage = message;
        this.notifyMessage = notifyMessage;
        this.response = response;
    }
}

const createController = (callback) => async (req, res) => {
    try {
        await callback(req, res);
    } catch (e) {
        if (e instanceof ResponseError) {
            respond({
                res,
                response: e.response,
                message: e.responseMessage,
                notifyMessage: e.notifyMessage,
            });
        } else {
            respond({ res, response: RESPONSE.BAD, message: e.message });
        }
    }
};

const mapToResponseError =
    ({ response = RESPONSE.BAD, message, notifyMessage }) =>
    (e) => {
        throw new ResponseError({ message: message ?? e.message, notifyMessage, response });
    };

export { respond, RESPONSE, ResponseError, createController, mapToResponseError };

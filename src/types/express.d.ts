import pino from "pino";

declare global {
    namespace Express {
        interface Request {
            requestId: string;
            logger: pino.Logger;
        }
    }
}

export {};
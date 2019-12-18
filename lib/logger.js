const winston = require('winston');
const logger = winston.createLogger({
        level: 'debug',
        format: winston.format.json(),
        // defaultMeta: { service: 'logs' },
        transports: [
            //
            // - Write to all logs with level `info` and below to `combined.log`
            // - Write all logs error (and below) to `error.log`.
            //
            // new winston.transports.File({ filename: 'error.log', level: 'error' }),
            // new winston.transports.File({ filename: 'combined.log' })
        ]
    });

    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (process.env.NODE_ENV !== 'production') {
        const alignedWithColorsAndTime = winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.printf((info) => {
                const {
                    timestamp, level, message, ...args
                } = info;

                const ts = timestamp.slice(0, 19).replace('T', ' ');
                return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
            }),
        );

        logger.add(new winston.transports.Console({
            silent: process.env.NODE_ENV === 'test',
            format: alignedWithColorsAndTime
        }));
    }

module.exports = logger;
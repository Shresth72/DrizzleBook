import pino from "pino";

export const logger = pino({
  redact: ["DATABASE_URL"],
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

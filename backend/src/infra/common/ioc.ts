export const infra = {
  environment: {
    mongoDbUri: Symbol.for('MONGODB_URI'),
    mongoDbName: Symbol.for('MONGODB_NAME'),
    messageBrokerUrl: Symbol.for('RABBITMQ_URL'),
  },
};

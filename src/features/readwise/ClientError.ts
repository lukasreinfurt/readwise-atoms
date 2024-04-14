export default class ClientError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = 'ClientError';
  }
}

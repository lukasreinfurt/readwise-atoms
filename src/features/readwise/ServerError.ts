export default class ServerError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = 'ServerError';
  }
}

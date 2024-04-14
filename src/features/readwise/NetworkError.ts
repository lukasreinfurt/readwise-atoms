export default class NetworkError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = 'NetworkError';
  }
}

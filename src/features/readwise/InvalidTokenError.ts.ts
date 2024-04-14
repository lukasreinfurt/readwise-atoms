export default class InvalidTokenError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

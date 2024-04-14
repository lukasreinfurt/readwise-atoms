export default class UnidentifiedError extends Error {
  constructor(message?: string | undefined) {
    super(message);
    this.name = 'UnidentifiedError';
  }
}

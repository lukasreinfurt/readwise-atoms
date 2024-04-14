import ClientError from './ClientError';
import InvalidTokenError from './InvalidTokenError.ts';
import NetworkError from './NetworkError';
import ServerError from './ServerError';
import UnidentifiedError from './UnidentifiedError';

export default class Readwise {
  apiBaseURL = 'https://readwise.io/api/v2/';
  token: string;
  updatedAfter = null;

  constructor(token: string) {
    this.token = token;
  }

  public async isTokenValid() {
    const response = await this.request('auth/');
    return response.status === 204;
  }

  public async getHighlights() {
    let fullData = [];
    let nextPageCursor = null;

    if (!(await this.isTokenValid())) {
      throw new InvalidTokenError('The supplied Readwise token seems to be invalid');
    }

    while (true) {
      const queryParams = new URLSearchParams();

      if (nextPageCursor) {
        queryParams.append('pageCursor', nextPageCursor);
      }

      if (this.updatedAfter) {
        queryParams.append('updatedAfter', this.updatedAfter);
      }

      const response = await this.request('export/', queryParams);

      const responseJson = await response.json();
      fullData.push(...responseJson['results']);
      nextPageCursor = responseJson['nextPageCursor'];

      if (!nextPageCursor) {
        break;
      }
    }
    return fullData;
  }

  async request(resource: string, queryParams?: URLSearchParams) {
    const queryParamsString = queryParams && queryParams.toString() !== '' ? '?' + queryParams?.toString() : '';
    const URL = this.apiBaseURL + resource + queryParamsString;
    let response: Response;

    try {
      response = await fetch(URL, {
        method: 'GET',
        headers: {
          Authorization: `Token ${this.token}`,
        },
      });
    } catch (error) {
      throw new NetworkError(error.message);
    }

    if (response.ok) {
      return response;
    } else {
      const message = `There was an error with the following request: ${URL}\n${response.status}: ${response.statusText}`;
      switch (response.status.toString().substring(0, 1)) {
        case '4':
          throw new ClientError(message);
        case '5':
          throw new ServerError(message);
        default:
          throw new UnidentifiedError(message);
      }
    }
  }
}

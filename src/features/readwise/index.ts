import ReadwiseAtoms from 'src/main';
import ClientError from './ClientError';
import InvalidTokenError from './InvalidTokenError.ts';
import NetworkError from './NetworkError';
import ServerError from './ServerError';
import UnidentifiedError from './UnidentifiedError';

export default class Readwise {
  apiBaseURL = 'https://readwise.io/api/v2/';
  plugin: ReadwiseAtoms;
  updatedAfter: string;

  constructor(plugin: ReadwiseAtoms) {
    this.plugin = plugin;
  }

  public async validateToken() {
    await this.request('auth/');
  }

  public async getHighlights() {
    let fullData = [];
    let nextPageCursor = null;

    await this.validateToken();

    while (true) {
      const queryParams = new URLSearchParams();

      if (nextPageCursor) {
        queryParams.append('pageCursor', nextPageCursor);
      }

      if (this.plugin.settings.readwiseUpdateAfter) {
        queryParams.append('updatedAfter', this.plugin.settings.readwiseUpdateAfter);
      }

      const response = await this.request('export/', queryParams);

      const responseJson = await response.json();
      fullData.push(...responseJson['results']);
      nextPageCursor = responseJson['nextPageCursor'];

      if (!nextPageCursor) {
        this.plugin.settings.readwiseUpdateAfter = new Date(Date.now()).toISOString();
        await this.plugin.saveSettings();
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
          Authorization: `Token ${this.plugin.settings.readwiseToken}`,
        },
      });
    } catch (error) {
      throw new NetworkError(error.message);
    }

    if (response.ok) {
      return response;
    } else {
      if (response.status === 401) throw new InvalidTokenError('The supplied Readwise token seems to be invalid');
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '30') * 1000 + 1000;
        await new Promise((_) => setTimeout(_, retryAfter));
        return this.request(resource, queryParams);
      }
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

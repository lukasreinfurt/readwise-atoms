export default class Readwise {
  apiBaseURL = 'https://readwise.io/api/v2/';
  token: string;
  updatedAfter = null;

  constructor(token: string) {
    this.token = token;
  }

  public async isTokenValid() {
    const response = await fetch(this.apiBaseURL + 'auth/', {
      method: 'GET',
      headers: {
        Authorization: `Token ${this.token}`,
      },
    });
    return response.status === 204;
  }

  public async getHighlights() {
    let fullData = [];
    let nextPageCursor = null;

    while (true) {
      const queryParams = new URLSearchParams();

      if (nextPageCursor) {
        queryParams.append('pageCursor', nextPageCursor);
      }

      if (this.updatedAfter) {
        queryParams.append('updatedAfter', this.updatedAfter);
      }

      console.log('Making export api request with params ' + queryParams.toString());
      const response = await fetch(this.apiBaseURL + 'export/?' + queryParams.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Token ${this.token}`,
        },
      });

      const responseJson = await response.json();
      fullData.push(...responseJson['results']);
      nextPageCursor = responseJson['nextPageCursor'];

      if (!nextPageCursor) {
        break;
      }
    }
    return fullData;
  }
}

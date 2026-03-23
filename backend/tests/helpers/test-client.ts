/* eslint-disable @typescript-eslint/no-explicit-any */
export class TestClient {
  private app: any;

  constructor(app: any) {
    this.app = app;
  }

  async request(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options: {
      headers?: Record<string, string>;
      body?: unknown;
      query?: Record<string, string>;
    } = {}
  ): Promise<{
    status: number;
    body: unknown;
    headers: Headers;
  }> {
    const { headers = {}, body, query } = options;

    let url = `http://localhost${path}`;
    if (query) {
      const searchParams = new URLSearchParams(query);
      url += `?${searchParams.toString()}`;
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const response = await this.app.handle(
      new Request(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      })
    );

    let responseBody: unknown;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    return {
      status: response.status,
      body: responseBody,
      headers: response.headers,
    };
  }

  get(path: string, options?: { headers?: Record<string, string>; query?: Record<string, string> }) {
    return this.request('GET', path, options);
  }

  post(path: string, options?: { headers?: Record<string, string>; body?: unknown; query?: Record<string, string> }) {
    return this.request('POST', path, options);
  }

  put(path: string, options?: { headers?: Record<string, string>; body?: unknown }) {
    return this.request('PUT', path, options);
  }

  patch(path: string, options?: { headers?: Record<string, string>; body?: unknown }) {
    return this.request('PATCH', path, options);
  }

  delete(path: string, options?: { headers?: Record<string, string> }) {
    return this.request('DELETE', path, options);
  }
}

export function createTestClient(app: any): TestClient {
  return new TestClient(app);
}

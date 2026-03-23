import type { TestClient } from './test-client';

export interface AuthTokens {
  token: string;
  userId: string;
  email: string;
  password: string;
}

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function createTestUser(): TestUser {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return {
    name: 'Test User',
    email: `test_${timestamp}_${random}@example.com`,
    password: 'Password123!',
  };
}

export async function registerAndLogin(
  client: TestClient,
  user?: Partial<TestUser>
): Promise<AuthTokens> {
  const testUser = createTestUser();
  const userData = { ...testUser, ...user };

  const registerResponse = await client.post('/auth/register', {
    body: userData,
  });

  if (registerResponse.status !== 200) {
    throw new Error(
      `Failed to register user: ${JSON.stringify(registerResponse.body)}`
    );
  }

  const loginResponse = await client.post('/auth/login', {
    body: {
      email: userData.email,
      password: userData.password,
    },
  });

  if (loginResponse.status !== 200) {
    throw new Error(
      `Failed to login user: ${JSON.stringify(loginResponse.body)}`
    );
  }

  const { token, user: userInfo } = loginResponse.body as {
    token: string;
    user: { id: string };
  };

  return {
    token,
    userId: userInfo.id,
    email: userData.email,
    password: userData.password,
  };
}

export function authHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

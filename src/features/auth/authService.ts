/** Mock auth - login với user123 / 123 */

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
}

const MOCK_USER: User = {
  id: 'user-1',
  username: 'user123',
  displayName: 'User Demo',
  email: 'user123@example.com',
};

export async function login(username: string, password: string): Promise<User | null> {
  if (username === 'user123' && password === '123') {
    return MOCK_USER;
  }
  return null;
}

export async function register(
  username: string,
  _password: string,
  displayName: string,
  email: string
): Promise<User | null> {
  // Mock: luôn thành công, tạo user mới
  return {
    id: `user-${Date.now()}`,
    username,
    displayName,
    email,
  };
}

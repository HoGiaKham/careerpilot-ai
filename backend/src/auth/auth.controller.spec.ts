import { AuthController } from './auth.controller';

describe('AuthController social login', () => {
  it('forwards the social display name from the request body to the auth service', async () => {
    const socialLogin = jest.fn().mockResolvedValue({ accessToken: 'token' });
    const controller = new AuthController({ socialLogin } as any);

    await controller.socialLogin({ token: 'firebase-token', name: 'Nguyễn Văn A' } as any);

    expect(socialLogin).toHaveBeenCalledWith('firebase-token', 'Nguyễn Văn A');
  });
});

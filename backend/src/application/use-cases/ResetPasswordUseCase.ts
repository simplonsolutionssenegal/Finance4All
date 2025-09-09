export interface ResetPasswordUseCase {
  execute(userId: string, newPassword: string): Promise<{ success: boolean; message: string }>;
}

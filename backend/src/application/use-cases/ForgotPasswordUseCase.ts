export interface ForgotPasswordUseCase {
  execute(email: string | undefined): Promise<{ success: boolean; message: string }>;
}

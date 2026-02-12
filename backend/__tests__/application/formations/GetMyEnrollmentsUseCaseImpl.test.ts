import { GetMyEnrollmentsUseCaseImpl } from '@/application/formations/use-cases/GetMyEnrollmentsUseCaseImpl';
import type { ModuleEnrollmentRepository } from '@/domain/formations/ports/out/ModuleEnrollmentRepository';

describe('GetMyEnrollmentsUseCaseImpl', () => {
  let useCase: GetMyEnrollmentsUseCaseImpl;
  let enrollmentRepository: jest.Mocked<ModuleEnrollmentRepository>;

  beforeEach(() => {
    enrollmentRepository = {
      createIfNotExists: jest.fn(),
      findByUserId: jest.fn(),
    } as any;

    useCase = new GetMyEnrollmentsUseCaseImpl(enrollmentRepository);
  });

  it('should return enrollments for user', async () => {
    const enrollments = [
      {
        id: 'enroll-1',
        moduleId: 'module-1',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    enrollmentRepository.findByUserId.mockResolvedValue(enrollments as any);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(enrollmentRepository.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(enrollments);
  });
});

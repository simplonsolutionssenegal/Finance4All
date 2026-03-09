import { render, screen } from '@testing-library/react';

import ModulesFormationPage from '@/app/(public)/modules-formation/page';
import { learningModuleService } from '@/services/learning-module.service';

jest.mock('@/services/learning-module.service', () => ({
  learningModuleService: {
    getModules: jest.fn(),
  },
}));

jest.mock('@/app/(public)/modules-formation/modules-client', () => ({
  ModulesClient: ({ initialModules }: { initialModules: Array<{ title: string }> }) => (
    <div>
      <h1>Modules Formation</h1>
      <span data-testid='modules-count'>{initialModules.length}</span>
      {initialModules.map(module => (
        <p key={module.title}>{module.title}</p>
      ))}
    </div>
  ),
}));

describe('ModulesFormationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes fetched modules to ModulesClient', async () => {
    (learningModuleService.getModules as jest.Mock).mockResolvedValue([
      {
        id: '1',
        title: 'Module A',
        description: 'Description A',
      },
      {
        id: '2',
        title: 'Module B',
        description: 'Description B',
      },
    ]);

    const view = await ModulesFormationPage();
    render(view);

    expect(learningModuleService.getModules).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Modules Formation')).toBeInTheDocument();
    expect(screen.getByTestId('modules-count')).toHaveTextContent('2');
    expect(screen.getByText('Module A')).toBeInTheDocument();
    expect(screen.getByText('Module B')).toBeInTheDocument();
  });

  it('falls back to empty modules when service throws', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    (learningModuleService.getModules as jest.Mock).mockRejectedValue(new Error('boom'));

    const view = await ModulesFormationPage();
    render(view);

    expect(learningModuleService.getModules).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('modules-count')).toHaveTextContent('0');
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

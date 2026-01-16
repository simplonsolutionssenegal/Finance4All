import {
  TranscodingStatus,
  isTerminalStatus,
  isPendingOrProcessing,
} from '@/domain/streaming/value-objects/TranscodingStatus';

describe('TranscodingStatus', () => {
  describe('enum values', () => {
    it('should have PENDING status', () => {
      expect(TranscodingStatus.PENDING).toBe('PENDING');
    });

    it('should have PROCESSING status', () => {
      expect(TranscodingStatus.PROCESSING).toBe('PROCESSING');
    });

    it('should have COMPLETED status', () => {
      expect(TranscodingStatus.COMPLETED).toBe('COMPLETED');
    });

    it('should have FAILED status', () => {
      expect(TranscodingStatus.FAILED).toBe('FAILED');
    });

    it('should have exactly 4 status values', () => {
      const statusValues = Object.values(TranscodingStatus);
      expect(statusValues).toHaveLength(4);
    });
  });

  describe('isTerminalStatus', () => {
    it('should return true for COMPLETED status', () => {
      expect(isTerminalStatus(TranscodingStatus.COMPLETED)).toBe(true);
    });

    it('should return true for FAILED status', () => {
      expect(isTerminalStatus(TranscodingStatus.FAILED)).toBe(true);
    });

    it('should return false for PENDING status', () => {
      expect(isTerminalStatus(TranscodingStatus.PENDING)).toBe(false);
    });

    it('should return false for PROCESSING status', () => {
      expect(isTerminalStatus(TranscodingStatus.PROCESSING)).toBe(false);
    });
  });

  describe('isPendingOrProcessing', () => {
    it('should return true for PENDING status', () => {
      expect(isPendingOrProcessing(TranscodingStatus.PENDING)).toBe(true);
    });

    it('should return true for PROCESSING status', () => {
      expect(isPendingOrProcessing(TranscodingStatus.PROCESSING)).toBe(true);
    });

    it('should return false for COMPLETED status', () => {
      expect(isPendingOrProcessing(TranscodingStatus.COMPLETED)).toBe(false);
    });

    it('should return false for FAILED status', () => {
      expect(isPendingOrProcessing(TranscodingStatus.FAILED)).toBe(false);
    });
  });

  describe('status transitions', () => {
    it('should correctly identify non-terminal states', () => {
      const nonTerminalStatuses = [TranscodingStatus.PENDING, TranscodingStatus.PROCESSING];

      for (const status of nonTerminalStatuses) {
        expect(isTerminalStatus(status)).toBe(false);
        expect(isPendingOrProcessing(status)).toBe(true);
      }
    });

    it('should correctly identify terminal states', () => {
      const terminalStatuses = [TranscodingStatus.COMPLETED, TranscodingStatus.FAILED];

      for (const status of terminalStatuses) {
        expect(isTerminalStatus(status)).toBe(true);
        expect(isPendingOrProcessing(status)).toBe(false);
      }
    });
  });

  describe('status values as strings', () => {
    it('should be usable as object keys', () => {
      const statusMap: Record<TranscodingStatus, string> = {
        [TranscodingStatus.PENDING]: 'Waiting to start',
        [TranscodingStatus.PROCESSING]: 'In progress',
        [TranscodingStatus.COMPLETED]: 'Done',
        [TranscodingStatus.FAILED]: 'Error',
      };

      expect(statusMap[TranscodingStatus.PENDING]).toBe('Waiting to start');
      expect(statusMap[TranscodingStatus.PROCESSING]).toBe('In progress');
      expect(statusMap[TranscodingStatus.COMPLETED]).toBe('Done');
      expect(statusMap[TranscodingStatus.FAILED]).toBe('Error');
    });

    it('should be comparable with string values', () => {
      expect(TranscodingStatus.PENDING === 'PENDING').toBe(true);
      expect(TranscodingStatus.PROCESSING === 'PROCESSING').toBe(true);
      expect(TranscodingStatus.COMPLETED === 'COMPLETED').toBe(true);
      expect(TranscodingStatus.FAILED === 'FAILED').toBe(true);
    });
  });
});

export enum TranscodingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export function isTerminalStatus(status: TranscodingStatus): boolean {
  return status === TranscodingStatus.COMPLETED || status === TranscodingStatus.FAILED;
}

export function isPendingOrProcessing(status: TranscodingStatus): boolean {
  return status === TranscodingStatus.PENDING || status === TranscodingStatus.PROCESSING;
}

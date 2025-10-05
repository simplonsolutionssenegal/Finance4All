import type { Status } from '@/types/Status';
import type { Zone } from '@/types/Zone';

export interface InstituteHeaderProps {
  logoSrc: string;
  name: string;
  status: Status;
  website?: string;
  description?: string;
  zones: Zone[];
}

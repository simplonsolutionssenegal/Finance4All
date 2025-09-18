export class ClerkUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  organisationId: number | null;
  role: string | null;   // 👈 nouveau
  lastSignInAt: Date | null;
  lastActiveAt: Date | null;

  constructor(data: {
    id: string;
    createdAt: number;
    updatedAt: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    emailAddresses: { emailAddress: string }[];
    publicMetadata?: { organisation_id?: number; role?: string }; // 👈 on accepte role
    lastSignInAt?: number;
    lastActiveAt?: number;
  }) {
    this.id = data.id;
    this.createdAt = new Date(data.createdAt);
    this.updatedAt = new Date(data.updatedAt);
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.emailAddresses[0]?.emailAddress || '';
    this.organisationId = data.publicMetadata?.organisation_id ?? null;
    this.role = data.publicMetadata?.role ?? null;   // 👈 ajouté
    this.lastSignInAt = data.lastSignInAt ? new Date(data.lastSignInAt) : null;
    this.lastActiveAt = data.lastActiveAt ? new Date(data.lastActiveAt) : null;
  }

  get status(): 'ACTIF' | 'INACTIF' | 'EN_ATTENTE' {
    if (this.lastActiveAt) {
      return 'ACTIF';
    }
    if (!this.lastSignInAt && !this.lastActiveAt) {
      return 'EN_ATTENTE';
    }
    return 'INACTIF';
  }

  get isActive(): boolean {
    return this.status === 'ACTIF';
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      organisationId: this.organisationId,
      role: this.role,   // 👈 inclus dans le JSON
      lastSignInAt: this.lastSignInAt,
      lastActiveAt: this.lastActiveAt,
      status: this.status,
      isActive: this.isActive,
    };
  }
}

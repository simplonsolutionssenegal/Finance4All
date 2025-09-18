// __tests__/components/admin/institution-financiere/validation-schema.logo-size.test.ts
import '@testing-library/jest-dom';
import { formSchema } from '@/components/admin/institution-financiere/validation-schema';
import { MAX_FILE_SIZE } from '@/components/admin/institution-financiere/constants';

// ⚠️ Polyfill minimal de FileList pour que "instanceof FileList" fonctionne
class MyFileList {
  length: number;
  private _items: File[];
  constructor(files: File[]) {
    this._items = files;
    this.length = files.length;
    // Ajoute les indices numériques (0, 1, …) comme sur un vrai FileList
    files.forEach((f, i) => ((this as any)[i] = f));
  }
  item(i: number): File | null {
    return this._items[i] ?? null;
  }
}
// expose comme FileList globale
global.FileList = MyFileList as unknown as typeof FileList;

const baseValues = {
  nom: 'AB',
  type: 'Banque',
  description: '0123456789', // 10 caractères
  siteWeb: 'https://exemple.com',
  contactNom: '',
  contactEmail: '',
  contactTelephone: '',
  regionsDesservies: ['DAKAR'],
};

// Crée un File de N octets
function makeFileOfSize(bytes: number, name = 'logo.jpg', type = 'image/jpeg') {
  const content = new Uint8Array(bytes);
  return new File([content], name, { type });
}

// Construit un "FileList" qui passe instanceof FileList
function makeFileList(file: File): FileList {
  return new MyFileList([file]) as unknown as FileList;
}

describe('validation-schema logo size refine (lignes 18-21)', () => {
  it('rejette un logo dont la taille dépasse MAX_FILE_SIZE', () => {
    const tooBig = makeFileOfSize(MAX_FILE_SIZE + 1);
    const files = makeFileList(tooBig);

    const parsed = formSchema.safeParse({ ...baseValues, logo: files });

    expect(parsed.success).toBe(false);
    // On est bien passé les "custom" et on tape le message de la refine de taille
    const err = parsed.success ? '' : parsed.error.flatten().fieldErrors.logo?.[0];
    expect(err).toMatch(/La taille maximale du fichier est de 5MB/i);
  });

  it('accepte un logo dont la taille est <= MAX_FILE_SIZE', () => {
    const ok = makeFileOfSize(MAX_FILE_SIZE);
    const files = makeFileList(ok);

    const parsed = formSchema.safeParse({ ...baseValues, logo: files });

    expect(parsed.success).toBe(true);
  });
});

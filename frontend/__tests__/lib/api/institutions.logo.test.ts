import '@testing-library/jest-dom';
import { createInstitution } from '@/lib/api/institutions';

// ------- Polyfills -------

// Polyfill minimal de FileList (vrai instanceof)
class MyFileList {
  length: number;
  private _items: File[];
  constructor(files: File[] = []) {
    this._items = files;
    this.length = files.length;
    files.forEach((f, i) => ((this as any)[i] = f));
  }
  item(i: number): File | null {
    return this._items[i] ?? null;
  }
}
const OLD_FILE_LIST = global.FileList;
global.FileList = MyFileList as unknown as typeof FileList;

const OLD_FILE_READER = global.FileReader;
const OLD_FETCH = global.fetch;

// Mock FileReader pour retourner une dataURL et appeler onload
class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  readAsDataURL(file: File) {
    this.result = 'data:image/jpeg;base64,ZmFrZUJhc2U2NA=='; // fake base64
    setTimeout(() => this.onload && this.onload.call(this as any, {} as any), 0);
  }
}

function makeFileList(file: File): FileList {
  // @ts-expect-error: notre polyfill est monté sur global.FileList
  return new global.FileList([file]);
}

describe('createInstitution - conversion logo en base64 via FileReader', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    
    // mock fetch OK
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '1',
        nom: 'Avec logo',
        type: 'Banque',
        description: 'desc',
        siteWeb: 'https://exemple.com',
        statut: 'Actif',
        createdAt: '2025-09-16T12:00:00Z',
      }),
    } as any);
    // mock FileReader
    global.FileReader = MockFileReader as any;
  });

  afterAll(() => {
    global.FileReader = OLD_FILE_READER as any;
    global.fetch = OLD_FETCH as any;
    global.FileList = OLD_FILE_LIST as any;
  });

  it('lit le premier fichier et envoie le logo base64 dans le payload', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'logo.jpg', { type: 'image/jpeg' });
    const files = makeFileList(file); // <-- instanceof FileList sera vrai

    const formValues = {
      nom: 'Avec logo',
      type: 'Banque',
      description: 'desc de 10+ car.',
      siteWeb: 'https://exemple.com',
      contactNom: '',
      contactEmail: '',
      contactTelephone: '',
      regionsDesservies: ['DAKAR'],
      logo: files,
    };

    const res = await createInstitution(formValues as any);
    expect(res.nom).toBe('Avec logo');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/institutions',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining(
          '"logo":"data:image/jpeg;base64,ZmFrZUJhc2U2NA=="'
        ),
      })
    );
  });
});

// hooks/media/useUploadMedia.ts
import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useLoader } from '@/contexts/LoaderContext';

type BackendResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

// adapte ce type selon la réponse exacte de ton API
export type MediaDTO = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  type: 'VIDEO' | 'PDF' | 'AUDIO';
  size: number;
  url: string;
  bucket: string;
  path: string;
  metadata: Record<string, string> | null;
  isTemporary: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

async function uploadMediaRequest(
  file: File,
  token: string | null,
  metadata?: Record<string, string>
) {
  const formData = new FormData();

  // ⚠️ IMPORTANT: le nom du champ doit correspondre à ton multer
  // très souvent c'est "file"
  formData.append('file', file);

  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata));
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/media`,
    {
      method: 'POST',
      headers: {
        // Ne mets PAS "Content-Type" ici, le navigateur le met avec boundary
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  const json = (await res.json()) as BackendResponse<MediaDTO>;

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Upload échoué');
  }

  if (!json.data) {
    throw new Error('Réponse upload invalide: data manquant');
  }

  return json.data;
}

export function useUploadMedia() {
  const { getToken } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata?: Record<string, string> }) => {
      showLoader();
      const token = await getToken();
      return uploadMediaRequest(file, token, metadata);
    },
    onSuccess: () => {
      hideLoader();
      toast.success('Fichier uploadé ✅');
    },
    onError: (err: Error) => {
      hideLoader();
      toast.error('Upload échoué', { description: err.message });
    },
  });
}

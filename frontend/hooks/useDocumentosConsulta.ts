import { useEffect, useState, useCallback, useRef } from "react";
import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "./auth/useAuth";
import { apiFetch, API_URL } from "../lib/api";

export interface DocumentoResponse {
  id: number;
  consultaId: number;
  nomeArquivo: string;
  tipoMime: string | null;
  criadoEm: string;
  url: string;
}

export interface UseDocumentosConsultaReturn {
  documents: DocumentoResponse[];
  isLoading: boolean;
  error: string | null;
  isUploading: boolean;
  uploadError: string | null;
  fetchDocuments: () => void;
  pickAndUpload: () => Promise<void>;
}

export function useDocumentosConsulta(consultaId: number): UseDocumentosConsultaReturn {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadingRef = useRef(false);

  const fetchDocuments = useCallback(() => {
    setIsLoading(true);
    setError(null);
    apiFetch<DocumentoResponse[]>(`/api/consultas/${consultaId}/documentos`, {
      token: token ?? undefined,
    })
      .then(setDocuments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [consultaId, token]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const pickAndUpload = useCallback(async () => {
    if (uploadingRef.current) return;

    uploadingRef.current = true;
    setIsUploading(true);
    setUploadError(null);

    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: false,
      });

      if (pickerResult.canceled) {
        return;
      }

      const asset = pickerResult.assets[0];
      if (!asset) {
        return;
      }

      const formData = new FormData();
      if (Platform.OS === "web" && asset.file) {
        formData.append("file", asset.file);
      } else {
        formData.append("file", {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? "application/octet-stream",
        } as unknown as Blob);
      }

      const response = await fetch(`${API_URL}/api/consultas/${consultaId}/documentos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(body.message || "Upload failed");
      }

      fetchDocuments();
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Falha no envio do documento");
    } finally {
      uploadingRef.current = false;
      setIsUploading(false);
    }
  }, [consultaId, token, fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    isUploading,
    uploadError,
    fetchDocuments,
    pickAndUpload,
  };
}

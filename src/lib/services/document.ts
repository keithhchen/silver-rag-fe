import api from "../api";

export interface DocumentUploadResponse {
    filename: string;
    gcs_document_id: string;
    html_content?: string;
    markdown_content: string;
    dify_document_id: string;
    dify_upload_file_id: string;
    id: number;
    created_at: string;
}

export interface PaginatedDocumentResponse {
    items: DocumentUploadResponse[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export async function getDocuments(page: number = 1, page_size: number = 10): Promise<PaginatedDocumentResponse> {
    try {
        const response = await api.get<PaginatedDocumentResponse>(`/documents/list?page=${page}&page_size=${page_size}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 422:
                    throw error;
                case 400:
                    throw error;
                case 500:
                    throw error;
                default:
                    throw new Error("An unexpected error occurred");
            }
        }
        throw error;
    }
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse[]> {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await api.post<DocumentUploadResponse[]>("/documents/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 422:
                    throw error;
                case 400:
                    throw error;
                case 500:
                    throw error;
                default:
                    throw new Error("An unexpected error occurred");
            }
        }
        throw error;
    }
}

export async function deleteDocument(documentId: number): Promise<void> {
    try {
        await api.delete(`/documents/${documentId}`);
    } catch (error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 422:
                    throw error;
                case 400:
                    throw error;
                case 500:
                    throw error;
                default:
                    throw new Error("An unexpected error occurred");
            }
        }
        throw error;
    }
}

export async function getSingleDocument(params: { id?: number; gcs_document_id?: string; dify_document_id?: string }): Promise<DocumentUploadResponse> {
    const queryParams = new URLSearchParams();
    if (params.id) queryParams.append('id', params.id.toString());
    if (params.gcs_document_id) queryParams.append('gcs_document_id', params.gcs_document_id);
    if (params.dify_document_id) queryParams.append('dify_document_id', params.dify_document_id);

    try {
        const response = await api.get<DocumentUploadResponse>(`/documents/single?${queryParams.toString()}`);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 422:
                    throw error;
                case 400:
                    throw error;
                case 500:
                    throw error;
                default:
                    throw new Error("An unexpected error occurred");
            }
        }
        throw error;
    }
}

export async function getDocumentFile(documentId: number): Promise<Blob> {
    try {
        const response = await api.get(`/documents/${documentId}/file`, {
            responseType: 'blob',
            headers: {
                Accept: 'application/pdf',
            },
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 422:
                    throw error;
                case 400:
                    throw error;
                case 500:
                    throw error;
                default:
                    throw new Error("An unexpected error occurred");
            }
        }
        throw error;
    }
}

export async function openDocumentInNewWindow(documentId: number): Promise<void> {
    try {
        const blob = await getDocumentFile(documentId);
        const blobUrl = URL.createObjectURL(blob);

        // Check if the user is on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // For mobile devices, create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `document-${documentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // For desktop, open in new window
            window.open(blobUrl, '_blank');
        }

        // Clean up the blob URL after a short delay
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 100);
    } catch (error: any) {
        if (error.response) {
            switch (error.response.status) {
                case 422:
                    throw error;
                case 400:
                    throw error;
                case 500:
                    throw error;
                default:
                    throw new Error("An unexpected error occurred");
            }
        }
        throw error;
    }
}
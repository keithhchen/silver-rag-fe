"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentCard } from "@/components/DocumentCard";
import {
  DocumentUploadResponse,
  getSingleDocument,
} from "@/lib/services/document";

export default function SingleDocumentPage() {
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<DocumentUploadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const id = searchParams.get("id");
        const gcsDocumentId = searchParams.get("gcs_document_id");
        const difyDocumentId = searchParams.get("dify_document_id");

        if (!id && !gcsDocumentId && !difyDocumentId) {
          setError("No document identifier provided");
          return;
        }

        const response = await getSingleDocument({
          id: id ? parseInt(id) : undefined,
          gcs_document_id: gcsDocumentId || undefined,
          dify_document_id: difyDocumentId || undefined,
        });

        setDocument(response);
      } catch (error: any) {
        console.error("Error fetching document:", error);
        setError(error.message || "Failed to fetch document");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [searchParams]);

  const handleDelete = async () => {
    if (!document) return;
    try {
      await getSingleDocument({ id: document.id });
    } catch (error) {
      console.error("Error refreshing document:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">文件详情</h1>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : document ? (
        <div className="max-w-2xl mx-auto">
          <DocumentCard document={document} onDelete={handleDelete} />
        </div>
      ) : (
        <div className="text-center text-gray-500">Document not found</div>
      )}
    </div>
  );
}

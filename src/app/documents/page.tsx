"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getDocuments, DocumentUploadResponse } from "@/lib/services/document";
import { DocumentCard } from "@/components/DocumentCard";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentUploadResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchDocuments();
  }, [currentPage]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await getDocuments(currentPage, pageSize);
      setDocuments(response.items);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">文件</h1>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={fetchDocuments}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          上一页
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

import { FileText, Trash2, Upload, Check } from "lucide-react";
import { DocumentUploadResponse } from "@/lib/services/document";
import { DocumentCard } from "@/components/DocumentCard";

import { getDocuments, uploadDocument } from "@/lib/services/document";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentUploadResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "错误",
        description: "只支持上传 PDF 文件",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const toastResult = toast({
      title: `上传文件：${file.name}`,
      description: (
        <div className="w-full">
          <Progress value={0} className="w-full" />
        </div>
      ),
      duration: Infinity,
    });

    try {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + Math.floor(Math.random() * 10) + 1, 90);
        setUploadProgress(progress);
        toastResult.update({
          title: `上传文件：${file.name}`,
          description: (
            <div className="w-full">
              <Progress value={progress} className="w-full" />
            </div>
          ),
        });
      }, 500);

      await uploadDocument(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      toastResult.update({
        title: "上传成功",
        description: (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            {file.name}
          </div>
        ),
        duration: 1000,
      });

      // Clear the file input using ref
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh the document list
      await fetchDocuments();
    } catch (error: any) {
      toastResult.update({
        title: "错误",
        description: error.message || "文件上传失败",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">文件</h1>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
            disabled={isUploading}
          />
          <Button
            variant="default"
            className="cursor-pointer"
            disabled={isUploading}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </Button>
        </div>
      </div>

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

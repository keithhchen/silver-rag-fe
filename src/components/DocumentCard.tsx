import { format } from "date-fns";
import { FileText, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DocumentUploadResponse,
  deleteDocument,
  openDocumentInNewWindow,
} from "@/lib/services/document";

interface DocumentCardProps {
  document: DocumentUploadResponse;
  onDelete: (id: number) => Promise<void>;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl truncate">
            {document.filename}
          </CardTitle>
        </div>
        <CardDescription>
          {format(new Date(document.created_at), "yyyy-MM-dd")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500 truncate">
          {document.markdown_content}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={async () => {
              try {
                setIsLoading(true);
                await openDocumentInNewWindow(document.id);
              } catch (error) {
                console.error("Error viewing document:", error);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              "查看原文"
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要删除这个文件吗？此操作无法撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await deleteDocument(document.id);
                      await onDelete(document.id);
                    } catch (error) {
                      console.error("Error deleting document:", error);
                    }
                  }}
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-xs text-gray-300 w-full">
          <p className="truncate font-mono">{document.gcs_document_id}</p>
        </div>
      </CardFooter>
    </Card>
  );
}

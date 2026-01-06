import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  userId: string;
  documentType: 'bank-statement' | 'earnings';
  existingFiles?: string[];
  onFilesChange?: (files: string[]) => void;
  className?: string;
}

export function FileUpload({ 
  userId, 
  documentType, 
  existingFiles = [], 
  onFilesChange,
  className 
}: FileUploadProps) {
  const [files, setFiles] = useState<string[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const label = documentType === 'bank-statement' 
    ? 'Bank Statements' 
    : 'Earnings Documents';

  const description = documentType === 'bank-statement'
    ? 'Upload bank statements to help us understand your spending patterns (PDF, up to 10MB)'
    : 'Upload earnings reports or financial statements (PDF, up to 10MB)';

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    const newFiles: string[] = [];

    try {
      for (const file of Array.from(fileList)) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            variant: 'destructive',
            title: 'File too large',
            description: `${file.name} exceeds the 10MB limit`,
          });
          continue;
        }

        if (file.type !== 'application/pdf') {
          toast({
            variant: 'destructive',
            title: 'Invalid file type',
            description: 'Only PDF files are allowed',
          });
          continue;
        }

        const fileName = `${userId}/${documentType}/${Date.now()}-${file.name}`;
        
        const { error } = await supabase.storage
          .from('profile-documents')
          .upload(fileName, file);

        if (error) {
          toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: error.message,
          });
          continue;
        }

        newFiles.push(fileName);
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      if (newFiles.length > 0) {
        toast({
          title: 'Upload successful',
          description: `${newFiles.length} file(s) uploaded`,
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload error',
        description: error.message || 'Failed to upload files',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('profile-documents')
        .remove([filePath]);

      if (error) throw error;

      const updatedFiles = files.filter(f => f !== filePath);
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);

      toast({
        title: 'File removed',
        description: 'Document has been deleted',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const getFileName = (path: string) => {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    // Remove timestamp prefix
    return fileName.replace(/^\d+-/, '');
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          uploading && "pointer-events-none opacity-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag & drop or click to upload
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
            >
              <File className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="flex-1 truncate">{getFileName(file)}</span>
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(file);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

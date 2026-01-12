import { useState, useRef } from 'react';
import { analyzeDocument, DocumentAnalysisResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, X, Loader2, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface FileUploadProps {
  userId: string;
  documentType: 'bank-statement' | 'earnings';
  existingFiles?: string[];
  onFilesChange?: (files: string[]) => void;
  onAnalysisComplete?: (analysis: DocumentAnalysisResponse) => void;
  className?: string;
}

export function FileUpload({ 
  userId, 
  documentType, 
  existingFiles = [], 
  onFilesChange,
  onAnalysisComplete,
  className 
}: FileUploadProps) {
  const [files, setFiles] = useState<string[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResponse | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const label = documentType === 'bank-statement' 
    ? 'Bank Statement (Optional)' 
    : 'Earnings Document (Optional)';

  const description = documentType === 'bank-statement'
    ? 'Upload a bank statement for AI-powered financial analysis and personalized hedge recommendations'
    : 'Upload earnings reports for AI-powered business analysis and risk insights';

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    // Only process the first file
    const file = fileList[0];

    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: `${file.name} exceeds the 10MB limit`,
      });
      return;
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload an image (PNG, JPG) or PDF file',
      });
      return;
    }

    setUploading(true);
    setAnalyzing(true);
    setUploadedFileName(file.name);

    try {
      // Send to backend for AI analysis
      const result = await analyzeDocument(userId, file);
      
      setAnalysis(result);
      onAnalysisComplete?.(result);
      
      toast({
        title: 'Analysis complete!',
        description: 'Your financial document has been analyzed successfully',
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis failed',
        description: error.message || 'Failed to analyze document. Please try again.',
      });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleRemove = () => {
    setAnalysis(null);
    setUploadedFileName('');
    
    toast({
      title: 'Analysis cleared',
      description: 'You can upload a new document',
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {!analysis ? (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            uploading && "pointer-events-none opacity-50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">
                  {analyzing ? 'Analyzing with AI...' : 'Uploading...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  This may take 10-20 seconds
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, PNG, or JPG (max 10MB)
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <CardTitle className="text-base">Analysis Complete</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{uploadedFileName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Income */}
            {analysis.analysis.income && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Income</p>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  ${analysis.analysis.income.amount?.toLocaleString() || 'N/A'} 
                  {analysis.analysis.income.frequency && ` (${analysis.analysis.income.frequency})`}
                </p>
              </div>
            )}

            {/* Expenses */}
            {analysis.analysis.expenses && Object.keys(analysis.analysis.expenses).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Top Expenses</p>
                <div className="space-y-1.5 pl-2">
                  {Object.entries(analysis.analysis.expenses)
                    .slice(0, 5)
                    .map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">
                          {category.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium">${amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {analysis.analysis.vulnerabilities && analysis.analysis.vulnerabilities.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <p className="text-sm font-medium">Financial Vulnerabilities</p>
                </div>
                <div className="space-y-1.5 pl-6">
                  {analysis.analysis.vulnerabilities.map((vuln, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs text-orange-600">•</span>
                      <p className="text-xs text-muted-foreground">{vuln}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hedge Suggestions */}
            {analysis.analysis.hedge_suggestions && analysis.analysis.hedge_suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recommended Hedges</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.analysis.hedge_suggestions.map((suggestion, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {analysis.analysis.summary && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground italic">
                  {analysis.analysis.summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

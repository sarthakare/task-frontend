"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileText, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { FileValidator } from "@/lib/file-validation";
import type { TaskAttachment } from "@/types";

interface TaskAttachmentUploadProps {
  taskId: number;
  onAttachmentUploaded?: (attachment: TaskAttachment) => void;
}

export function TaskAttachmentUpload({ taskId, onAttachmentUploaded }: TaskAttachmentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Use enhanced file validation
    const validationResult = FileValidator.validateFiles(files, {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      checkContent: true,
    });
    
    if (!validationResult.isValid) {
      toast.error('File validation failed', {
        description: validationResult.errors.join(', '),
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    }
    
    if (validationResult.warnings.length > 0) {
      toast.warning('File validation warnings', {
        description: validationResult.warnings.join(', '),
        icon: <CircleAlert className="text-yellow-600" />,
      });
    }
    
    if (validationResult.isValid) {
      setSelectedFiles(prev => [...prev, ...files]);
      
      if (files.length > 0) {
        toast.success('Files added successfully', {
          description: `${files.length} file(s) ready for upload`,
          icon: <CheckCircle2 className="text-green-600" />,
        });
      }
    }
    
    // Clear the input
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected', {
        description: 'Please select at least one file to upload.',
      });
      return;
    }

    setIsUploading(true);
    const uploadedAttachments: TaskAttachment[] = [];
    const failedUploads: string[] = [];

    for (const file of selectedFiles) {
      const fileKey = `${file.name}-${file.size}`;
      setUploadingFiles(prev => new Set(prev).add(fileKey));

      try {
        const attachment = await api.tasks.uploadAttachmentToTask(taskId, file);
        uploadedAttachments.push(attachment);
        
        toast.success('File uploaded', {
          description: `${file.name} has been uploaded successfully.`,
          icon: <CheckCircle2 className="text-green-600" />,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        failedUploads.push(file.name);
        
        toast.error('Upload failed', {
          description: `Failed to upload ${file.name}: ${errorMessage}`,
          icon: <CircleAlert className="text-red-600" />,
        });
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileKey);
          return newSet;
        });
      }
    }

    // Clear selected files
    setSelectedFiles([]);

    // Notify parent component
    if (uploadedAttachments.length > 0 && onAttachmentUploaded) {
      uploadedAttachments.forEach(attachment => {
        onAttachmentUploaded(attachment);
      });
    }

    // Show summary
    if (uploadedAttachments.length > 0 && failedUploads.length === 0) {
      toast.success('All files uploaded successfully!', {
        description: `${uploadedAttachments.length} file(s) have been added to the task.`,
      });
    } else if (uploadedAttachments.length > 0 && failedUploads.length > 0) {
      toast.warning('Partial upload completed', {
        description: `${uploadedAttachments.length} file(s) uploaded, ${failedUploads.length} failed.`,
      });
    }

    setIsUploading(false);
  };

  // const formatFileSize = (bytes: number) => FileValidator.formatFileSize(bytes);

  const isFileUploading = (file: File) => {
    const fileKey = `${file.name}-${file.size}`;
    return uploadingFiles.has(fileKey);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="attachment-upload" className="text-sm font-medium text-gray-700">
          Upload Files
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="attachment-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="file:mr-4 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-indigo-100 transition-all"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => document.getElementById('attachment-upload')?.click()}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            {selectedFiles.length} file(s) selected:
          </p>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md border border-blue-200">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {file.size > 1024 * 1024 
                        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${(file.size / 1024).toFixed(1)} KB`
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isFileUploading(file) && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isFileUploading(file)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {selectedFiles.length} File(s)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

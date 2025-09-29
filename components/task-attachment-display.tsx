"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Trash2, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  FileArchive,
  FileVideo,
  FileAudio,
  File,
  MoreVertical,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/lib/api-service";
import { FileValidator } from "@/lib/file-validation";
import type { TaskAttachment } from "@/types";

interface TaskAttachmentDisplayProps {
  attachments: TaskAttachment[];
  taskId?: number;
  canEdit?: boolean;
  onAttachmentDeleted?: () => void;
}

export function TaskAttachmentDisplay({ 
  attachments, 
  canEdit = false, 
  onAttachmentDeleted 
}: TaskAttachmentDisplayProps) {
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return <FileSpreadsheet className="h-4 w-4" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return <FileArchive className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = (mimeType: string) => FileValidator.getFileTypeColor(mimeType);

  const formatFileSize = (bytes: number) => FileValidator.formatFileSize(bytes);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      await api.tasks.downloadAttachment(attachment.id);
      toast.success('Download completed', {
        description: `${attachment.original_filename} has been downloaded.`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to download the file. Please try again.';
      toast.error('Download failed', {
        description: errorMessage,
      });
    }
  };

  const handleDelete = async (attachment: TaskAttachment) => {
    if (!canEdit) {
      toast.error('Permission denied', {
        description: 'You do not have permission to delete this attachment.',
      });
      return;
    }

    setDeletingIds(prev => new Set(prev).add(attachment.id));

    try {
      await api.tasks.deleteAttachment(attachment.id);
      toast.success('Attachment deleted', {
        description: `${attachment.original_filename} has been removed.`,
      });
      
      if (onAttachmentDeleted) {
        onAttachmentDeleted();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete attachment';
      toast.error('Delete failed', {
        description: errorMessage,
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachment.id);
        return newSet;
      });
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No attachments</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Attachments ({attachments.length})
        </h3>
      </div>
      
      <div className="grid gap-3">
        {attachments.map((attachment) => (
          <Card key={attachment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(attachment.mime_type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.original_filename}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getFileTypeColor(attachment.mime_type)}`}
                      >
                        {attachment.mime_type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{formatFileSize(attachment.file_size)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(attachment.created_at)}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(attachment)}
                          disabled={deletingIds.has(attachment.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingIds.has(attachment.id) ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

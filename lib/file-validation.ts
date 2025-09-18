// lib/file-validation.ts
// Frontend file validation utilities for enhanced security

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileValidationOptions {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  maxFiles?: number;
  checkContent?: boolean;
}

export class FileValidator {
  private static readonly DEFAULT_OPTIONS: FileValidationOptions = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/rtf',
      'application/vnd.oasis.opendocument.text',
      
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/svg+xml',
      'image/webp',
      
      // Spreadsheets
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.oasis.opendocument.spreadsheet',
      
      // Presentations
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation',
      
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      
      // Code files
      'text/x-python',
      'application/javascript',
      'text/html',
      'text/css',
      'application/json',
      'application/xml',
      'text/x-sql',
      
      // Media files
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-ms-wmv',
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
    ],
    maxFiles: 10,
    checkContent: true,
  };

  private static readonly DANGEROUS_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
    '.class', '.php', '.asp', '.aspx', '.jsp', '.py', '.pl', '.sh', '.ps1',
    '.dll', '.sys', '.drv', '.ocx', '.cpl', '.msi', '.msp', '.mst', '.reg',
    '.inf', '.ini', '.cfg', '.conf', '.log', '.tmp', '.temp', '.swp', '.lock'
  ];

  private static readonly SUSPICIOUS_PATTERNS = [
    // Script patterns
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    
    // Code execution patterns
    /eval\(/i,
    /exec\(/i,
    /system\(/i,
    /shell_exec\(/i,
    /passthru\(/i,
    /popen\(/i,
    /proc_open\(/i,
    
    // File system access
    /\.\.\//,
    /\.\.\\/,
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
    /C:\\Windows\\System32/i,
    /\/proc\//i,
    /\/sys\//i,
    /\/dev\//i,
    
    // Network patterns
    /http:\/\//i,
    /https:\/\//i,
    /ftp:\/\//i,
    /file:\/\//i,
    /data:/i,
    
    // SQL injection patterns
    /union select/i,
    /drop table/i,
    /delete from/i,
    /insert into/i,
    /update set/i,
    /alter table/i,
    /create table/i,
    /exec\(/i,
    /execute\(/i,
    /sp_executesql/i,
  ];

  static validateFiles(files: File[], options: Partial<FileValidationOptions> = {}): FileValidationResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file count
    if (files.length > (opts.maxFiles || 10)) {
      errors.push(`Too many files. Maximum allowed: ${opts.maxFiles || 10}`);
    }

    // Validate each file
    for (const file of files) {
      const fileResult = this.validateFile(file, opts);
      errors.push(...fileResult.errors);
      warnings.push(...fileResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateFile(file: File, options: Partial<FileValidationOptions> = {}): FileValidationResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > opts.maxFileSize) {
      errors.push(`${file.name} is too large (${this.formatFileSize(file.size)}). Maximum allowed: ${this.formatFileSize(opts.maxFileSize)}`);
    }

    // Check file type
    if (!opts.allowedTypes.includes(file.type)) {
      errors.push(`${file.name} has an unsupported file type (${file.type})`);
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (this.DANGEROUS_EXTENSIONS.includes(extension.toLowerCase())) {
      errors.push(`${file.name} has a potentially dangerous file extension (${extension})`);
    }

    // Check for suspicious filename patterns
    if (this.hasSuspiciousFilename(file.name)) {
      errors.push(`${file.name} has a suspicious filename pattern`);
    }

    // Check file size patterns
    if (file.size === 0) {
      errors.push(`${file.name} is empty`);
    } else if (file.size < 10) {
      warnings.push(`${file.name} is very small (${file.size} bytes) - this might be suspicious`);
    }

    // Content validation (if enabled and file is small enough)
    if (opts.checkContent && file.size < 1024 * 1024) { // Only check files < 1MB
      this.validateFileContent(file).then(result => {
        if (!result.isValid) {
          errors.push(...result.errors);
        }
        warnings.push(...result.warnings);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static async validateFileContent(file: File): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const text = await file.text();
      
      // Check for suspicious patterns
      for (const pattern of this.SUSPICIOUS_PATTERNS) {
        if (pattern.test(text)) {
          errors.push(`${file.name} contains suspicious content: ${pattern.source}`);
        }
      }

      // Check for high entropy (potential obfuscation)
      const entropy = this.calculateEntropy(text);
      if (entropy > 7.5) {
        warnings.push(`${file.name} has high entropy content (potential obfuscation)`);
      }

      // Check for suspicious file extensions in content
      const suspiciousExtensions = this.DANGEROUS_EXTENSIONS.filter(ext => 
        text.toLowerCase().includes(ext.toLowerCase())
      );
      
      if (suspiciousExtensions.length > 0) {
        warnings.push(`${file.name} references suspicious file extensions: ${suspiciousExtensions.join(', ')}`);
      }

    } catch (error) {
      // If we can't read the file as text, it might be binary - that's usually fine
      warnings.push(`${file.name} could not be read as text (likely binary file)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private static hasSuspiciousFilename(filename: string): boolean {
    const suspiciousPatterns = [
      /\.\./,           // Path traversal
      /[<>:"|?*]/,      // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
      /\.(exe|bat|cmd|com|scr|pif|vbs|js|jar|class|php|asp|aspx|jsp|py|pl|sh|ps1)$/i, // Executable extensions
      /^\./,            // Hidden files
      /~$/,             // Temporary files
      /\.tmp$/,         // Temporary files
      /\.temp$/,        // Temporary files
      /\.swp$/,         // Swap files
      /\.lock$/,        // Lock files
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot);
  }

  private static calculateEntropy(text: string): number {
    if (!text) return 0;

    const charCounts: { [key: string]: number } = {};
    for (const char of text) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }

    let entropy = 0;
    const textLength = text.length;
    
    for (const count of Object.values(charCounts)) {
      const probability = count / textLength;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  static getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('text/')) return '📄';
    return '📁';
  }

  static getFileTypeColor(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'bg-red-100 text-red-800';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'bg-blue-100 text-blue-800';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'bg-orange-100 text-orange-800';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'bg-purple-100 text-purple-800';
    if (mimeType.startsWith('video/')) return 'bg-pink-100 text-pink-800';
    if (mimeType.startsWith('audio/')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  }
}

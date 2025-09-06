export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface ServerConfig {
  port: number;
  corsOrigins: string[];
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedImageTypes: string[];
  uploadPath: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  jwt: JwtConfig;
  server: ServerConfig;
  fileUpload: FileUploadConfig;
  logLevel: string;
}

export default (): AppConfig => ({
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://localhost:5432/skate_marketplace',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
  },
  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedImageTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
});

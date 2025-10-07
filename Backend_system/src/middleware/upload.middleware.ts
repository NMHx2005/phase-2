import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const imagesDir = path.join(uploadsDir, 'images');
const filesDir = path.join(uploadsDir, 'files');

[uploadsDir, avatarsDir, imagesDir, filesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// File filter for images
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// File filter for all files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow images, documents, and other common file types
    const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed!'));
    }
};

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = uploadsDir;

        if (file.fieldname === 'avatar') {
            uploadPath = avatarsDir;
        } else if (file.fieldname === 'image') {
            uploadPath = imagesDir;
        } else {
            uploadPath = filesDir;
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Multer configuration
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Maximum 5 files per request
    },
    fileFilter: fileFilter
});

// Specific upload configurations
export const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
        files: 1 // Only 1 avatar per request
    },
    fileFilter: imageFilter
});

export const uploadImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit for images
        files: 3 // Maximum 3 images per request
    },
    fileFilter: imageFilter
});

// Image processing utility
export const processImage = async (inputPath: string, outputPath: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
} = {}) => {
    try {
        const {
            width = 800,
            height = 600,
            quality = 80,
            format = 'jpeg'
        } = options;

        await sharp(inputPath)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality })
            .toFile(outputPath);

        return true;
    } catch (error) {
        console.error('Image processing error:', error);
        return false;
    }
};

// Avatar processing utility
export const processAvatar = async (inputPath: string, outputPath: string) => {
    try {
        await sharp(inputPath)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toFile(outputPath);

        return true;
    } catch (error) {
        console.error('Avatar processing error:', error);
        return false;
    }
};

// File cleanup utility
export const deleteFile = (filePath: string) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('File deletion error:', error);
        return false;
    }
};

// Get file URL utility
export const getFileUrl = (req: any, filePath: string) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const relativePath = filePath.replace(/\\/g, '/').replace(/.*\/uploads\//, '/uploads/');
    return `${baseUrl}${relativePath}`;
};

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 5 files per request.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field name.'
            });
        }
    }

    if (error.message === 'Only image files are allowed!' ||
        error.message === 'File type not allowed!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
};

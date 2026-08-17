import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { Request } from 'express';
import { UPLOAD_CONFIG } from '../configs/upload.config.js';

const tempDirectory = path.join(
    process.cwd(),
    'uploads',
    'tmp'
)

if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, {
        recursive: true
    })
}

const storage = multer.diskStorage({
    destination: (
        req: Request,
        file: Express.Multer.File,
        cb
    ) => {
        cb(null, tempDirectory);
    },

    filename: (
        req: Request,
        file: Express.Multer.File,
        cb
    ) => {
        const filename = `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`;
        cb(null, filename);
    }

})

const allowedExtensions =
    new Set([
        '.jpg',
        '.jpeg',
        '.png',
        '.webp'
    ])

const allowedMimeTypes =
    new Set([
        'image/jpeg',
        'image/png',
        'image/webp'
    ])

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
        !allowedExtensions.has(extension) ||
        !allowedMimeTypes.has(file.mimetype)
    ) {
        cb(new Error('Invalid Image Type'));
        return;
    }
    cb(null, true);
}

export const uploadProductVariantImages = multer({
    storage,
    limits: {
        fileSize : UPLOAD_CONFIG.variantImages.maxFileSize,
        files : UPLOAD_CONFIG.variantImages.maxFiles
    },
    fileFilter
}).array(
    'images',
    UPLOAD_CONFIG.variantImages.maxFiles
);
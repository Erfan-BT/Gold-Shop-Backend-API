import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { UPLOAD_CONFIG } from '../configs/upload.config.js';

export class ImageService {

    static async processVariantImage(
        file: Express.Multer.File
    ) {

        const config = UPLOAD_CONFIG.variantImages;

        const outputDirectory = config.directory;

        await fs.mkdir(
            outputDirectory,
            {
                recursive: true
            }
        );

        const filename = `variant-${crypto.randomUUID()}.webp`;

        const outputPath =
            path.join(
                outputDirectory,
                filename
            );

        try {

            const metadata =
                await sharp(file.path)
                    .metadata();

            if (
                !metadata.width ||
                !metadata.height
            ) {
                throw new Error(
                    'Invalid Image'
                );
            }

            if (
                metadata.width > 10000 ||
                metadata.height > 10000
            ) {
                throw new Error(
                    'Image Dimensions Are Too Large'
                );
            }

            await sharp(file.path)
                .rotate()
                .resize({
                    width: config.maxWidth,
                    height: config.maxHeight,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({
                    quality: config.quality
                })
                .toFile(outputPath);

            return {
                filename,
                path: outputPath,
                url: `/uploads/variant-images/${filename}`
            };

        } catch (error) {

            await fs
                .unlink(outputPath)
                .catch(() => {});

            throw error;

        } finally {

            await fs
                .unlink(file.path)
                .catch(() => {});

        }

    }

    static async deleteImage(
        filePath: string
    ) {

        await fs
            .unlink(filePath)
            .catch(() => {});

    }

}
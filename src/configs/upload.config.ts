import path from 'node:path';

export const UPLOAD_CONFIG = {

    variantImages : {
        directory: path.join(
            process.cwd(),
            'uploads',
            'variant-images'
        ),

        maxFiles: 10,

        maxFileSize: 5 * 1024 * 1024,

        maxWidth: 2400,

        maxHeight: 2400,

        quality: 85
    }

}
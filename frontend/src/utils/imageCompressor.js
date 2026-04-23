/**
 * Compress an image file using canvas.
 * Returns a new File with reduced size.
 * PDFs are returned as-is (no compression).
 */
export function compressImage(file, { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = {}) {
    return new Promise((resolve, reject) => {
        if (file.type === 'application/pdf') {
            resolve(file);
            return;
        }

        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                if (width <= maxWidth && height <= maxHeight && file.size <= 1024 * 1024) {
                    resolve(file);
                    return;
                }

                const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                const outputQuality = file.type === 'image/png' ? undefined : quality;

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }
                        const compressed = new File([blob], file.name, {
                            type: outputType,
                            lastModified: Date.now(),
                        });
                        resolve(compressed.size < file.size ? compressed : file);
                    },
                    outputType,
                    outputQuality
                );
            };
            img.onerror = () => resolve(file);
            img.src = e.target.result;
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export function formatFileSize(bytes) {
    if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

export function validateFile(file, maxSizeMB = 10) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { valid: false, error: `Invalid file type: ${file.type || 'Unknown'}. Only PDF, JPG, PNG, WebP, Word, and PPT are allowed.` };
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `File too large (${formatFileSize(file.size)}). Maximum is ${maxSizeMB} MB.` };
    }
    return { valid: true, error: null };
}

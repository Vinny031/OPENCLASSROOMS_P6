const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// Configuration du stockage pour multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        // Génère un nom de fichier unique pour éviter les conflits, mais on enlève l'extension initiale
        const name = file.originalname.split(' ').join('_');
        const baseName = path.parse(name).name;
        const extension = MIME_TYPES[file.mimetype];
        callback(null, baseName + Date.now() + '.' + extension);
    }
});

// Création de l'objet upload avec la configuration de stockage
const upload = multer({ storage: storage });

// Middleware pour optimiser l'image
const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();

    const { filename, path: filePath } = req.file;

    try {
        // Supprimer l'extension existante
        const baseName = path.parse(filename).name;

        // Créer un nom de fichier final avec l'extension correcte .webp
        const outputFileName = `${baseName}.webp`;
        const outputFilePath = path.join('images', outputFileName);

        // Désactiver le cache pour éviter des problèmes de performance
        sharp.cache(false);

        // Convertir l'image en WebP avec des dimensions définies
        await sharp(filePath)
            .resize({ width: 460, height: 600, fit: 'cover' })
            .webp({ quality: 100, lossless: true })
            .toFile(outputFilePath);

        // Supprimer le fichier original après conversion
        fs.unlink(filePath, err => {
            if (err) console.error('Error removing original file:', err);
        });

        // Mettre à jour le chemin et le nom du fichier dans la requête
        req.file.filename = outputFileName;
        req.file.path = outputFilePath;

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    upload,
    optimizeImage
};

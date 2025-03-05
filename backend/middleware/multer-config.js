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
       // Génère un nom de fichier unique pour éviter les conflits
      const name = file.originalname.split(' ').join('_');
      const extension = MIME_TYPES[file.mimetype];
      callback(null, name + Date.now() + '.' + extension);
    }
  });
  // Création de l'objet upload avec la configuration de stockage
  const upload = multer({ storage: storage });
  
  // Middleware pour optimiser l'image
  const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();
    
    const { filename, path: filePath } = req.file; // Récupère le nom et le chemin du fichier téléchargé
  
    try {
       // Chemin du fichier de sortie après conversion en format webp
      const outputFilePath = path.join('images', `${path.parse(filename).name}.webp`);
      sharp.cache(false)
      await sharp(filePath)
        .resize({ width: 206, height: 260 })
        .webp({ quality: 100 })
        .toFile(outputFilePath);
  
      // Supprimer le fichier original après conversion
      fs.unlink(filePath, err => {
       
        if (err) console.error('Error removing original file:', err);
      });
  
      // Mettre à jour le chemin et le nom du fichier dans la requête
      req.file.filename = path.basename(outputFilePath);
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
const multer = require('multer');
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        const name = file.originalname.split(' ').join('_');
        const ext = MIME_TYPES[file.mimetype];
        cb(null, name + Date.now() + '.' + ext);
    }
});

// Création de l'objet upload avec la configuration de stockage
const upload = multer({ storage: storage });

module.exports = upload; 
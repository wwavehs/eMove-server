const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirectories = () => {
    const directories = [
        path.join(__dirname, '../../uploads'),
        path.join(__dirname, '../../uploads/licenses'),
        path.join(__dirname, '../../uploads/employees')
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

// Create directories on startup
createUploadDirectories();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set different destinations based on file field name
        const uploadDir = file.fieldname === 'employeeIdPhoto'
            ? '../../uploads/employees'
            : '../../uploads/licenses';
        const fullPath = path.join(__dirname, uploadDir);

        // Ensure directory exists before saving
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`Created directory on-demand: ${fullPath}`);
        }

        cb(null, fullPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'employeeIdPhoto' ? 'employee-' : 'license-';
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
    console.log('Received file:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype
    });

    // Accept these MIME types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log('Rejected file type:', file.mimetype);
        cb(new Error(`File type not allowed. Allowed types: ${allowedMimes.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// Export middleware that handles both file fields
module.exports = {
    single: upload.single.bind(upload),
    fields: upload.fields.bind(upload),
    uploadFields: upload.fields([
        { name: 'driversLicenseIdPhoto', maxCount: 1 },
        { name: 'employeeIdPhoto', maxCount: 1 }
    ])
}; 
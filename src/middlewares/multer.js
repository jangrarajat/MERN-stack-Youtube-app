import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');   // file kaha save hogi
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // yaha file.filename galat tha, sahi hoga file.originalname
        cb(null, file.originalname + '-' + uniqueSuffix);
    }
});

export const upload = multer({
    storage
});

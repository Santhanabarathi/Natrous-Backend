import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
  { name: "photo", maxCount: 1 },
]);

const uploadAllFiles = async (req, res, next) => {
  uploadFields(req, res, async (err) => {
    if (err) return next(err);

    if (!req.files) return next();

    try {
      // Handle tour cover
      if (req.files["imageCover"] && req.files["imageCover"][0]) {
        const file = req.files["imageCover"][0];
        const key = `Tour-cover/${Date.now()}-${file.originalname}`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );
        req.file = { key }; // compatible with your tourController
      }

      // Handle tour images array
      if (req.files["images"] && req.files["images"].length > 0) {
        const urls = await Promise.all(
          req.files["images"].map(async (file) => {
            const key = `TourImage/${Date.now()}-${file.originalname}`;
            await s3Client.send(
              new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
              })
            );
            return key;
          })
        );
        req.uploadedFiles = urls;
      }

      // Handle user profile image
      if (req.files["photo"] && req.files["photo"][0]) {
        const file = req.files["photo"][0];
        const key = `ProfileImage/${Date.now()}-${file.originalname}`;
        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );
        req.profileImage = { key }; // you can use this in userController
      }

      next();
    } catch (error) {
      next(error);
    }
  });
};

const generatePresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return signedUrl;
};

export { uploadAllFiles, generatePresignedUrl };

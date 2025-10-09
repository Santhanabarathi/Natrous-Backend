const Tour = require("../models/tourSchema");
const { generatePresignedUrl } = require("../services/multer-s3");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

exports.getAlltour = async (req, res) => {
  try {
    let tours = await Tour.find();

    tours = await Promise.all(
      tours.map(async (tour) => {
        if (tour?.imageCover) {
          tour.imageCover = await generatePresignedUrl(tour.imageCover);
        }

        // ✅ sign all images
        if (tour.images && tour.images.length > 0) {
          tour.images = await Promise.all(
            tour.images.map(async (key) => await generatePresignedUrl(key))
          );
        }

        return tour; // ✅ Make sure to return the tour
      })
    );

    res.status(200).json({
      status: "success",
      results: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "user", select: "name " },
      select: "-__v",
    })
    .populate({
      path: "guides",
      select: "name email role photo",
    })
    .lean();

  // Generate signed URLs for guide photos
  if (tour.guides && tour.guides.length > 0) {
    tour.guides = await Promise.all(
      tour.guides.map(async (guide) => {
        if (guide.photo) {
          guide.photo = await generatePresignedUrl(guide.photo);
        }
        return guide;
      })
    );
  }

  // Generate signed URL for imageCover
  if (tour.imageCover) {
    tour.imageCover = await generatePresignedUrl(tour.imageCover);
  }

  // Generate signed URLs for multiple images
  if (tour.images && tour.images.length > 0) {
    tour.images = await Promise.all(
      tour.images.map(async (key) => await generatePresignedUrl(key))
    );
  }

  // Optional: remove tour field from reviews
  if (tour.reviews) {
    tour.reviews.forEach((r) => delete r.tour);
  }

  if (!tour) {
    return next(new AppError("no id found", 404));
  }

  res.status(200).json({
    status: "success",
    data: tour,
  });
});

exports.createTour = async (req, res) => {
  try {
    if (req.file) {
      req.body.imageCover = req.file.key; // S3 object key
    }

    if (req.uploadedFiles && req.uploadedFiles.length > 0) {
      req.body.images = req.uploadedFiles;
    }

    if (req.body.startDates && typeof req.body.startDates === "string") {
      req.body.startDates = JSON.parse(req.body.startDates);
    }

    if (req.body.locations && typeof req.body.locations === "string") {
      req.body.locations = JSON.parse(req.body.locations);
    }

    if (req.body.startLocation && typeof req.body.startLocation === "string") {
      req.body.startLocation = JSON.parse(req.body.startLocation);
    }
    if (typeof req.body.guides === "string") {
      req.body.guides = JSON.parse(req.body.guides);
    }

    const tour = await Tour.create(req.body);

    res.status(201).json({ status: "success", data: tour });
  } catch (err) {
    console.error("Create tour error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.updateTour = async (req, res) => {
  const tourdetails = await Tour.findById(req.params.id);

  // --- Handle removedImages --
  if (req.body.removedImages && typeof req.body.removedImages === "string") {
    req.body.removedImages = JSON.parse(req.body.removedImages);
  }

  const bucketBaseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
  const removeKeys = Array.isArray(req.body.removedImages)
    ? req.body.removedImages.map(
        (url) => url.replace(bucketBaseUrl, "").split("?")[0]
      )
    : [];

  tourdetails.images = tourdetails.images.filter(
    (key) => !removeKeys.includes(key)
  );

  if (req.body.removedImageCover) {
    req.body.removedImageCover = JSON.parse(req.body.removedImageCover);
  }

  //  images convet to key
  // cover image convet to key
  let removeCoverKey = null;

  if (req.body.removedImageCover) {
    removeCoverKey = req.body.removedImageCover
      .replace(bucketBaseUrl, "")
      .split("?")[0];

    if (tourdetails.imageCover === removeCoverKey) {
      tourdetails.imageCover = null;
    }
  }

  await tourdetails.save();

  // upload images
  if (req.file) {
    req.body.imageCover = req.file.key;
  }

  // Merge existing images (after removal) with newly uploaded images
  if (req.uploadedFiles && req.uploadedFiles.length > 0) {
    req.body.images = [...tourdetails.images, ...req.uploadedFiles];
  } else {
    // keep the remaining images if no new upload
    req.body.images = tourdetails.images;
  }

  if (req.body.startDates && typeof req.body.startDates === "string") {
    req.body.startDates = JSON.parse(req.body.startDates);
  }

  if (req.body.startLocation && typeof req.body.startLocation === "string") {
    req.body.startLocation = JSON.parse(req.body.startLocation);
  }

  if (req.body.locations && typeof req.body.locations === "string") {
    req.body.locations = JSON.parse(req.body.locations);
  }

  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate({ path: "reviews" });

  if (!tour) {
    new AppError("No id found", 404);
  }

  res.status(201).json({
    status: "success",
    data: tour,
  });
};

exports.deleteTour = async (req, res) => {
  await Tour.findByIdAndDelete(req.params.id, req.body);

  res.status(202).json({
    status: "success",
    message: "deleted",
  });
};

const User = require("../models/userSchema");
const mongoose = require("mongoose");

exports.bulkUpdateGuides = async (req, res) => {
  let { guideId, tourId } = req.body;

  if (!guideId || !tourId) {
    return res.status(400).json({
      status: "fail",
      message: "guideId and tourId are required",
    });
  }

  // Ensure tourId is an array
  if (!Array.isArray(tourId)) tourId = [tourId];

  const tourIds = tourId.map((id) => new mongoose.Types.ObjectId(id));
  const guideObjectId = new mongoose.Types.ObjectId(guideId);

  // 1️⃣ Update the user's tours (replace old ones)
  await User.findByIdAndUpdate(guideObjectId, { tours: tourIds });

  // 2️⃣ Update tours: add guide to new tours
  await Tour.updateMany(
    { _id: { $in: tourIds } },
    { $addToSet: { guides: guideObjectId } }
  );

  // 3️⃣ Optionally: remove guide from tours no longer assigned
  await Tour.updateMany(
    { _id: { $nin: tourIds }, guides: guideObjectId },
    { $pull: { guides: guideObjectId } }
  );

  res.status(200).json({
    status: "success",
    message: "Guide tours updated successfully",
  });
};

// exports.bulkUpdateGuides = async (req, res) => {
//   const { tourid, guides } = req.body;

//   if (!tourid || !guides) {
//     return res.status(400).json({
//       status: "fail",
//       message: "tourid and guides are required",
//     });
//   }

//   const tourIds = tourid.map((id) => new mongoose.Types.ObjectId(id));
//   const guideIds = guides.map((id) => new mongoose.Types.ObjectId(id));

//   // ✅ 1️⃣ Update all tours: add guides
//   await Tour.updateMany(
//     { _id: { $in: tourIds } },
//     { $addToSet: { guides: { $each: guideIds } } } // avoids duplicates
//   );

//   // ✅ 2️⃣ Update all users: add those tours to each guide
//   await User.updateMany(
//     { _id: { $in: guideIds } },
//     { $addToSet: { tours: { $each: tourIds } } } // avoids duplicates
//   );

//   // ✅ 3️⃣ Fetch updated data to confirm
//   const updatedTours = await Tour.find({ _id: { $in: tourIds } })
//     .select("name guides")
//     .populate("guides", "name email");

//   res.status(200).json({
//     status: "success",
//     message: "Guides and users updated successfully",
//     data: {
//       tours: updatedTours,
//     },
//   });
// };

// const mongoose = require("mongoose");

// exports.bulkUpdateGuides = async (req, res) => {
//   const { tourid, guides } = req.body;

//   if (!tourid || !guides) {
//     return res.status(400).json({
//       status: "fail",
//       message: "tourid and guides are required",
//     });
//   }

//   const tourIds = tourid.map((id) => new mongoose.Types.ObjectId(id));
//   const guidesObjectId = guides.map((id) => new mongoose.Types.ObjectId(id));

//   const upMany = await Tour.updateMany(
//     { _id: { $in: tourIds } },
//     { $addToSet: { guides: { $each: guidesObjectId } } } // ✅ add new guides without removing old ones
//   );

//   res.status(200).json({
//     status: "success",
//     data: {
//       upMany,
//     },
//   });
// };

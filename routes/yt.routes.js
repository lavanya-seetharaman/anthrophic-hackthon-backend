const { Router } = require('express');


const router = Router();

// const express = require("express");
// const router = express.Router();
const ytCtrl = require("../controllers/videos.controller");
const { protect } = require("../middlewares/users.middleware");


// admin routes
router.post("/search", protect, ytCtrl.apiGetVideoResults);
router.post("/getaudio", protect, ytCtrl.apiGetByVideoUrl);
//whisperapi routes
router.post("/gettranscribe", protect, ytCtrl.apiGetByVideoUrl);
router.post("/getSummary", protect, ytCtrl.getSummary);
module.exports = router;
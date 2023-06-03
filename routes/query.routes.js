const { Router } = require('express');


const router = Router();

// const express = require("express");
// const router = express.Router();
const queriesCtrl = require("../controllers/queries.controller");
const { protect } = require("../middlewares/users.middleware");

router.post("/getsavedquery", protect, queriesCtrl.getSavedQueryByemail);

module.exports = router;
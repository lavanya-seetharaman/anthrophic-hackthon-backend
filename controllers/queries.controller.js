const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const AppError = require("../helpers/appError");
const queryService = require("../services/queries.services");
const { Long } = require("mongodb");

const getSavedQueryByemail = async (req, res) => {
  try {
    const email = req.body;
    console.log(email.email);
    const savedQuery = await queryService.getQueryListByEmail(email.email);
    if (savedQuery) {
      console.log(savedQuery);
      res.status(200).json(savedQuery);
    }
  } catch (error) {
    res.status(404).json(error);
  }
};

module.exports = {
    getSavedQueryByemail
}

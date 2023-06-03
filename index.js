const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const mongodb =require("./mongodb/config");
const AppError = require("./helpers/appError");
const errorHandler = require("./helpers/errorHandler");
const headers = require("./helpers/headers");
const cors =require("cors");
const bodyParser = require("body-parser");
const Userrouter = require("./routes/users.routes");
const VideoRouter = require("./routes/yt.routes");

async function bootstrap() {
  const app = express();
  const PORT = process.env.PORT;
  
  app.use(passport.initialize());
  app.use(cors());
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL,
        scope: ["email", "profile"],
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(accessToken, profile);
      }
    )
  );
  app.use("/api/user", Userrouter);
  app.use("/api/v1", VideoRouter);
  app.all("*", (req, res, next) => {
    next(new AppError(`The URL ${req.originalUrl} does not exists`, 404));
  });
  
  app.use(headers);
  // using errors handler
  app.use(errorHandler);
  try {
    app.listen(PORT, () => console.log(`Application is listening at port ${PORT}`));
  } catch (err) {
    console.log(err);
  }
}


bootstrap();

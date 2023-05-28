import { config } from "dotenv";
config();
import express from "express";
import passport from "passport";
import axios from "axios";
import GoogleStrategy from "passport-google-oauth20";
import youtubedl from "youtube-dl-exec";
const google_base_api_url = "https://www.googleapis.com/youtube/v3";
const whisper_base_api_url = "https://transcribe.whisperapi.com";
async function bootstrap() {
  const app = express();
  const PORT = process.env.PORT;
  app.use(passport.initialize());
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL,
        scope: ["email", "profile"],
      },
      async (accessToken, refreshToken, profile, done) => {
        //code come here
        console.log(accessToken, profile);
      }
    )
  );

  app.get("/api/v1", (req, res) => {
    res.json({ message: `AI backend APP API working in ${PORT}` });
  });
  app.get(
    "/api/v1/auth/google",
    passport.authenticate("google"),
    (req, res) => {
      res.sendStatus(200);
    }
  );
  app.get(
    "/api/v1/auth/google/redirect",
    passport.authenticate("google"),
    (req, res) => {
      res.sendStatus(200);
    }
  );

  //https://www.googleapis.com/youtube/v3/search?part=snippet&q=deeplearning&key=AIzaSyAz7aR1LtUOKcGePjjEfVFmrthqDi1SKUc
  app.get("/api/v1/search", async (req, res, next) => {
    try {
      const searchQuery = req.query.search_query;
      console.log(searchQuery);
      const url = `${google_base_api_url}/search?key=${process.env.YT_DATA_API_KEY}&type=video&part=snippet&q=${searchQuery}`;
      const response = await axios.get(url); //youtube data api invoke 
      // console.log("response", response.data.items[0].id.videoId);
      let videoId = response.data.items[1].id.videoId;
      let videoUrl = `https://www.youtube.com/watch?v=${videoId}`; //https://youtu.be/QY8dhl1EQfI
      console.log(videoUrl);
      youtubedl(videoUrl, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ["referer:youtube.com", "user-agent:googlebot"],
      }).then((output) => {
        console.log(output);
        res.send(output);
      });
      
    } catch (err) {
      next(err);
    }
  });
  //whisper api
  app.get("/api/v1/gettext", async (req, res, next) => {
    try {
      const searchQuery = req.query.search_query;
      console.log(searchQuery);
      const url = `${google_base_api_url}/search?key=${process.env.YT_DATA_API_KEY}&type=video&part=snippet&q=${searchQuery}`;

      res.json(response.data);
    } catch (err) {
      next(err);
    }
  });

  try {
    app.listen(PORT, () => console.log(`${PORT} is working`));
  } catch (err) {
    console.log(err);
  }
}
bootstrap();

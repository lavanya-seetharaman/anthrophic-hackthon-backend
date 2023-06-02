// import { config } from "dotenv";
// config();
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const passport = require("passport");
const axios = require("axios");
const FormData = require("form-data");
const GoogleStrategy = require("passport-google-oauth20");
const youtubedl = require("youtube-dl-exec");
const mongodb =require("./mongodb/config");
const AppError = require("./helpers/appError");
const errorHandler = require("./helpers/errorHandler");
const headers = require("./helpers/headers");
const cors =require("cors");
const bodyParser = require("body-parser");
const Userrouter = require("./routes/users.routes");
const VideoRouter = require("./routes/yt.routes");
const google_base_api_url = "https://www.googleapis.com/youtube/v3";
const whisper_base_api_url = "https://transcribe.whisperapi.com";
const claude_base_api_url = "https://api.anthropic.com/";
// const client = new Client(apiKey);
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
        //code come here
        console.log(accessToken, profile);
      }
    )
  );
  app.use("/api/user", Userrouter);
  app.use("/api/v1", VideoRouter);
  // app.get("/api/v1", (req, res) => {
  //   res.json({ message: `AI backend APP API working in ${PORT}` });
  // });
  // app.get(
  //   "/api/v1/auth/google",
  //   passport.authenticate("google"),
  //   (req, res) => {
  //     res.sendStatus(200);
  //   }
  // );
  // app.get(
  //   "/api/v1/auth/google/redirect",
  //   passport.authenticate("google"),
  //   (req, res) => {
  //     res.sendStatus(200);
  //   }
  // );

  //https://www.googleapis.com/youtube/v3/search?part=snippet&q=deeplearning&key=AIzaSyAz7aR1LtUOKcGePjjEfVFmrthqDi1SKUc
  // app.get("/api/v1/search", async (req, res, next) => {
  //   try {
  //     const searchQuery = req.query.search_query;
  //     console.log(searchQuery);
  //     const url = `${google_base_api_url}/search?key=${process.env.YT_DATA_API_KEY}&type=video&part=snippet&q=${searchQuery}`;
  //     const response = await axios.get(url); //youtube data api invoke
  //     // console.log("response", response.data.items[0].id.videoId);
  //     let videoId = response.data.items[1].id.videoId;
  //     let videoUrl = `https://www.youtube.com/watch?v=${videoId}`; //https://youtu.be/QY8dhl1EQfI
  //     console.log(videoUrl);
  //     youtubedl(videoUrl, {
  //       dumpSingleJson: true,
  //       noCheckCertificates: true,
  //       noWarnings: true,
  //       preferFreeFormats: true,
  //       addHeader: ["referer:youtube.com", "user-agent:googlebot"],
  //     }).then((output) => {
  //       console.log(output);
  //       res.send(output);
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // });
  //whisperapi.com
  app.post("/api/v1/gettext", async (req, res) => {
    console.log("api not work");
    let data = new FormData();
    data.append(
      "url",
      "https://rr2---sn-npoe7nsl.googlevideo.com/videoplayback?expire=1685125178&ei=2qNwZLv5CuHtjuMPh9-FmAc&ip=2405%3A201%3Ae036%3A5c%3A510f%3A8d13%3A565%3Ac85f&id=o-AKV4gPd3Aoe7l8k_1-gE7Q0gwba6f9igC5vjXrhWGF7Z&itag=599&source=youtube&requiressl=yes&spc=qEK7B0EWKafdn5ybKK8qGUHmtPeW3HM&vprv=1&svpuc=1&mime=audio%2Fmp4&gir=yes&clen=1353038&dur=351.225&lmt=1677180390786007&keepalive=yes&fexp=24007246&c=ANDROID&txp=5432434&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRQIgcwK9H7bIJkcxxFxF-srnaHn8gWsi_R0IUbn-QU_tiTQCIQDCHpWXi4fOLd0GJ_DRcd1ScMDdEBY09j5L28OK3Fp2WQ%3D%3D&cm2rm=sn-gwpa-pmhs7s,sn-gwpa-h55k7l,sn-h55ls7z&req_id=b27d9f27f424a3ee&ipbypass=yes&redirect_counter=3&cms_redirect=yes&cmsv=e&mh=Rb&mm=34&mn=sn-npoe7nsl&ms=ltu&mt=1685104112&mv=m&mvi=2&pl=47&lsparams=ipbypass,mh,mm,mn,ms,mv,mvi,pl&lsig=AG3C_xAwRAIgOWVt0mGSijBE4bYZS8Bd_R2hiww-S5I4kAI27YQZuAwCIFmya7kophHce192eK8YzGd7_MpOH2YJWdUyxJeArPLC"
    );
    console.log("getText API working !");
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://transcribe.whisperapi.com",
      headers: {
        Authorization: "Bearer 9DHS5V1K983TCRS475UZ6DKTI5UGZA7R",
        ...data.getHeaders(),
      },
      data: data,
    };
    console.log(config);
    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  });

  //claude api https://api.anthropic.com/.
  // app.get(`${claude_base_api_url}v1/complete`, async (req, res, next) => {
  //   try {
  //     const searchQuery = req.query.search_query;
  //     console.log(searchQuery);
  //     const url = `${google_base_api_url}/search?key=${process.env.YT_DATA_API_KEY}&type=video&part=snippet&q=${searchQuery}`;
  //     res.json(response.data);
  //   } catch (err) {
  //     next(err);
  //   }
  // });

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

// node js apperror class (error) extanding  


bootstrap();

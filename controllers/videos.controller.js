const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const AppError = require("../helpers/appError");
const bcrypt = require("bcrypt");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const ytdl = require("ytdl-core");
const { Long } = require("mongodb");
const YoutubeTranscript = require('youtube-transcript');


const queryService = require("../services/queries.services");
const google_base_api_url = "https://www.googleapis.com/youtube/v3";

const apiGetVideoResults = async (req, res, next) => {
  try {
    const { email , searchQuery} = req.body;
    console.log(searchQuery);
    const queries = await queryService.createQuery(req.body);
    if (queries) {
    const url = `${google_base_api_url}/search?key=${process.env.YT_DATA_API_KEY}&type=video&part=snippet&q=${searchQuery}`;
    console.log(url);
    const response = await axios.get(url); //youtube data api invoke
    // console.log("response", response.data.items);
    if (response.data.items.length > 0) {
      console.log("inside the if condition");
      let items = response.data.items;
      // console.log(items);
      let finalResArray = [];
      items.map((item) => {
        console.log("inside map", item.snippet);
        let newObject = {};
        console.log("new Object", newObject);
        newObject.channelId = item.snippet.channelId;
        newObject.channelTitle = item.snippet.channelTitle;
        newObject.videoId = item.id.videoId;
        newObject.videoTitle = item.snippet.title;
        newObject.videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
        newObject.description = item.snippet.description;
        newObject.thumbnails = item.snippet.thumbnails;
        newObject.publishedAt = item.snippet.publishedAt;
        console.log("why its not print", newObject);
        finalResArray.push(newObject);
      });
      console.log(finalResArray);
      res.status(200).json(finalResArray);
    } else {
      res.status(404).json("No Results Found. Try Again!");
    }
  }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const apiGetByVideoUrl = async (req, res) => {
  try {
    let urls = [];
    const { videoId } = req.body;
    console.log(req.body);
    //instead of youtubedl; new package ytdl-core package changed.its working 
    let info = await ytdl.getInfo(videoId);
    let audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    // console.log(audioFormats);
    // let urlFormats = output.formats;
    audioFormats.map((format) => {
          urls.push(format.url);
        });
        let audio_result = {
          audio_url: urls[0], //audio format available in 3rd position
        };
        // console.log(audio_result);
        await gettranscribe(audio_result)
        .then((result)=>{
          if (result != undefined) {
            console.log("line 98");
            res.status(200).json(result);
          }
        }); //whisperapi api call
        
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const gettranscribe = async (audio_result) => {
  let result_txt;
  let data = new FormData();
  data.append("url", audio_result.audio_url);
  // console.log(audiourl);
  // console.log("getText API working !", data);
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://transcribe.whisperapi.com",
    headers: {
      Authorization: `Bearer ${process.env.WHISPER_API_KEY}`,
      ...data.getHeaders(),
    },
    data: data,
  };
  // console.log(config);
  await axios
    .request(config)
    .then((response) => {
      result_txt = {
        text: response.data.text,
        language: response.data.language,
      };
      console.log(result_txt);
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
  return result_txt;
};

//claude api https://api.anthropic.com/.
const getSummary = async (req, res) => {
  const transcribe_txt = req.body.transcribe_txt;
  try {
    let data = JSON.stringify({
      prompt: `\n\n Human: Here's a video transcript in <transcript> tags: \n <transcript>${transcribe_txt}</transcript>\nSummarize the transcript in one paragraph. Keep the summary within 300 words.\n\n Assistant: Here's the summary in 300 words <summary>`,
      model: "claude-instant-v1-100k",
      max_tokens_to_sample: 300,
      stop_sequences: ["\n\nHuman:"],
    });
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.anthropic.com/v1/complete",
      headers: {
        "x-api-key": process.env.CLUADE_API_KEY,
        "content-type": "application/json",
      },
      data: data,
    };
    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        res.status(200).json(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};


module.exports = {
  apiGetVideoResults,
  apiGetByVideoUrl,
  getSummary,
};

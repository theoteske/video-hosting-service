import express from "express";

const app = express();
app.use(express.json());

// set ffmpeg path
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

// simple GET endpoint to print "Hello, World!"
app.get("/", (req, res) => {
    res.send("Hello World!")
});

// POST endpoint to process video locally
app.post("/process-video", (req, res) => {
    // get path of the input video file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    // error handling, check if the above are undefined
    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.");
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=-1:360")
        .on("end", () => {
            res.status(200).send("Processing finished successfully.");
        })
        .on("error", (err: Error) => {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`);
        })
        .save(outputFilePath);
});

// set port
const port = process.env.PORT || 3000; // 3000 is default for express

// start server and listen on the port specified above for requests
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`)
});
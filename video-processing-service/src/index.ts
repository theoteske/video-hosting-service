import express from "express";
import { 
    setupDirectories, 
    downloadRawVideo, 
    uploadProcessedVideo, 
    convertVideo, 
    deleteRawVideoFile, 
    deleteProcessedVideoFile 
} from "./storage"
import { isVideoNew, setVideo } from "./firestore";

const app = express();
app.use(express.json());

setupDirectories();

// POST endpoint to process video locally
app.post("/process-video", async (req, res): Promise<any> => {
    // Get the bucket and filepath from the Cloud Pub/Sub messsage
    let data;
    try {
        const message = Buffer.from(req.body.message.data, "base64").toString("utf-8");
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error("Invalid message payload received.")
        }
    } catch (err) {
        console.error(err);
        return res.status(400).send("Bad Request: missing file name.")
    }

    const inputFileName = data.name; // format is <UID>-<DATETIME>.<EXTENSION>
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0];

    if (!isVideoNew(videoId)) {
        return res.status(400).send("Bad Request: video already processed or processing.");
    } else {
        await setVideo(videoId, {
            id: videoId,
            uid: videoId.split('-')[0],
            status: "processing"
        });
    }

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    // Convert the video to 360p
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch(err) {
        await Promise.all([
            deleteRawVideoFile(inputFileName),
            deleteProcessedVideoFile(outputFileName)
        ]);
        console.error(err);
        res.status(500).send("Internal Server Error: video processing failed.")
    }

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    setVideo(videoId, {
        status: "processed",
        filename: outputFileName
    })

    await Promise.all([
        deleteRawVideoFile(inputFileName),
        deleteProcessedVideoFile(outputFileName)
    ]);

    return res.status(200).send("Video processing succesfully completed.");
});

// set port
const port = process.env.PORT || 3000; // 3000 is default for express

// start server and listen on the port specified above for requests
app.listen(port, () => {
    console.log(`Video processing service listening at http://localhost:${port}`)
});
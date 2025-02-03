import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "tt-vt-raw-videos";
const processedVideoBucketName = "tt-vt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories(): void {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * Converts raw video to 360p.
 * 
 * @param rawVideoName The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A Promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // convert to 360p
        .on("end", () => {
            console.log("Processing finished successfully.");
            resolve();
        })
        .on("error", (err: Error) => {
            console.log(`An error occurred: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    })
}

/**
 * Downloads raw video from Google Cloud Storage.
 * 
 * @param fileName The name of the file to download from the {@link rawVideoBucketName} bucket 
 * into the {@link localRawVideoPath} folder.
 * @returns A Promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string): Promise<void> {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}` });
    
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`
    );
}

/**
 * Uploads processed video to Google Cloud Storage.
 * 
 * @param fileName The name of the file to upload from the {@link localProcessedVideoPath} into 
 * the {@link processedVideoBucketName} bucket.
 * @returns A Promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string): Promise<void> {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, { destination: fileName });
    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );

    await bucket.file(fileName).makePublic();
}

/**
 * Deletes a file from local storage.
 * 
 * @param filePath The path of the file to delete.
 * @returns A Promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            reject(`File not found at ${filePath}`); //debatable, could be console.log() the error then resolve
        } else {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            });
        }
    });
}

/**
 * Delete a raw video file from local storage.
 * 
 * @param fileName The name of the file to delete.
 * @returns A Promise that resolves when the file has been deleted.
 */
export function deleteRawVideoFile(fileName: string): Promise<void> {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * Delete a processed video file from local storage.
 * 
 * @param fileName The name of the file to delete.
 * @returns A Promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideoFile(fileName: string): Promise<void> {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * Ensures that a directory exists at the given file path.
 * 
 * @param dirPath The directory path to check or create.
 */
export function ensureDirectoryExistence(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }) // recursive true enables nested directory creation
        console.log(`Directory created at ${dirPath}`)
    }
    
}
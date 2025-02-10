import * as functions from "firebase-functions/v1";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";

initializeApp();

const firestore = new Firestore();
const storage = new Storage();
const rawVideoBucketName = "tt-vt-raw-videos";
const videoCollectionId = "videos";

export const createUser = functions.auth.user().onCreate((user) => {
    const userInfo = {
        uid: user.uid,
        email: user.email,
        photoUrl: user.photoURL,
    };

    firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);
    return;
});

/**
 * Generates a signed URL on the server.
 */
export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucketName);

    // Check if user is authenticated
    if (!auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The user must be authenticated."
        );
    }

    // Generate a unique file name
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    // Get a v4 signed URL to upload files
    const [url] = await bucket.file(fileName).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return {url, fileName};
});

export const getVideos = onCall({maxInstances: 1}, async () => {
    const snapshot =
    await firestore.collection(videoCollectionId).limit(10).get();
    return snapshot.docs.map((doc) => doc.data());
});

import { credential } from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();
const videoCollectionId = "videos";

export interface Video {
    id?: string,
    uid?: string,
    filename?: string,
    status?: "processing" | "processed",
    title?: string,
    description?: string
}

/**
 * Gets video from Firestore.
 * 
 * @param videoId The unique identifier for the video.
 * @returns A Promise that resolves with a Video object when the video has been retrieved.
 */
async function getVideo(videoId: string): Promise<Video> {
    const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
    return (snapshot.data() as Video) ?? {};
}

export function setVideo(videoId: string, video: Video) {
    return firestore.collection(videoCollectionId).doc(videoId).set(video, { merge: true });
}

export async function isVideoNew(videoId: string) {
    const video = await getVideo(videoId);
    return video?.status === undefined;
}
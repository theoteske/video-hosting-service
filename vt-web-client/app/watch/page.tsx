"use client";

import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function ShowVideo() {
    const videoPrefix = "https://storage.googleapis.com/tt-vt-processed-videos/";
    const videoSrc = useSearchParams().get('v');

    return (
        <div>
            <h1>Watch Page</h1>
            { <video controls src={videoPrefix + videoSrc}/> }
        </div>
    );
}

export default function Watch() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
          <ShowVideo />
        </Suspense>
    );
}
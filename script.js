import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.js";

const video = document.getElementById("camera");
const status = document.getElementById("status");
const timerDisplay = document.getElementById("timer");
const debugContent = document.getElementById("debug-content");

let faceLandmarker;
let lastVideoTime = -1;
let seconds = 0;

// Initialize Face Mesh
async function setupDetection() {
  const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task` },
    runningMode: "VIDEO",
    numFaces: 1
  });
  status.innerText = "READY - LOOK AT CAMERA TO START";
  status.className = "ready";
  startCamera();
}

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.addEventListener("loadeddata", predictWebcam);
}

async function predictWebcam() {
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const result = faceLandmarker.detectForVideo(video, performance.now());

    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      // Basic logic: If landmarks are found, the user is "Focused"
      status.innerText = "FOCUSED";
      updateTimer();
      
      // Log coordinates to debug panel
      const nose = result.faceLandmarks[0][1];
      debugContent.innerHTML = `<div>Face Detected: YES</div><div>Nose X: ${nose.x.toFixed(2)}</div>`;
    } else {
      status.innerText = "DISTRACTED";
    }
  }
  requestAnimationFrame(predictWebcam);
}

function updateTimer() {
    seconds++;
    let mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    let secs = (seconds % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${mins}:${secs}`;
}

setupDetection();

// client/src/components/FaceMesh.jsx
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FACEMESH_TESSELATION,
  FACEMESH_FACE_OVAL,
  FACEMESH_LIPS,
  FACEMESH_LEFT_IRIS,
  FACEMESH_RIGHT_IRIS,
  FACEMESH_LEFT_EYE,
  FACEMESH_RIGHT_EYE
} from "@mediapipe/face_mesh";

const FaceMeshComponent = forwardRef(({ width = 640, height = 480, onData }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);

  const [isOn, setIsOn] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const blinkingRef = useRef(false);
  const [openness, setOpenness] = useState(0);

  const OPEN_THRESHOLD = 0.35;
  const CLOSE_THRESHOLD = 0.15;

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const calcEAR = (lm, t, b, l, r) => dist(lm[t], lm[b]) / dist(lm[l], lm[r]);

  const onResults = (results) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(results.image, 0, 0, width, height);

    const faces = results.multiFaceLandmarks;
    if (!faces || faces.length === 0) return;
    const lm = faces[0];

    // draw mesh and features
    drawConnectors(ctx, lm, FACEMESH_TESSELATION, { lineWidth: 1 });
    drawConnectors(ctx, lm, FACEMESH_FACE_OVAL,   { color: "#FFAEBC", lineWidth: 2 });
    drawConnectors(ctx, lm, FACEMESH_LIPS,        { color: "#FF0000", lineWidth: 2 });
    drawConnectors(ctx, lm, FACEMESH_LEFT_IRIS,   { color: "#0000FF", lineWidth: 1 });
    drawConnectors(ctx, lm, FACEMESH_RIGHT_IRIS,  { color: "#0000FF", lineWidth: 1 });
    drawConnectors(ctx, lm, FACEMESH_LEFT_EYE,    { color: "#00FF00", lineWidth: 2 });
    drawConnectors(ctx, lm, FACEMESH_RIGHT_EYE,   { color: "#00FF00", lineWidth: 2 });

    // calculate EAR and openness
    const leftEAR  = calcEAR(lm, 159, 145, 33, 133);
    const rightEAR = calcEAR(lm, 386, 374, 362, 263);
    const ear = (leftEAR + rightEAR) / 2;
    const rawPct = ((ear - CLOSE_THRESHOLD) / (OPEN_THRESHOLD - CLOSE_THRESHOLD)) * 100;
    const pct = Math.round(Math.max(0, Math.min(100, rawPct)));
    setOpenness(pct);

    // blink detection
    if (pct <= 0) {
      blinkingRef.current = true;
    } else if (blinkingRef.current && pct > 0) {
      setBlinkCount(c => c + 1);
      blinkingRef.current = false;
    }
  };

  const startCamera = () => {
    if (!videoRef.current || cameraRef.current) return;
    setBlinkCount(0);
    setOpenness(0);

    if (!meshRef.current) {
      meshRef.current = new FaceMesh({ locateFile: f =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
      });
      meshRef.current.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      meshRef.current.onResults(onResults);
    }

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => await meshRef.current.send({ image: videoRef.current }),
      width,
      height
    });
    cameraRef.current.start();
    setIsOn(true);
  };

  const stopCamera = () => {
    cameraRef.current?.stop();
    cameraRef.current = null;
    setIsOn(false);
  };

  // expose toggle to parent
  useImperativeHandle(ref, () => ({
    toggle: () => {
      isOn ? stopCamera() : startCamera();
    }
  }));

  // lift data to parent when blinkCount or openness change
  useEffect(() => {
    onData && onData({ blinkCount, openness });
  }, [blinkCount, openness, onData]);

  useEffect(() => {
    return () => { cameraRef.current?.stop(); meshRef.current = null; };
  }, []);

  return (
    <div className="video-wrapper">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ visibility: "hidden", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
});

export default FaceMeshComponent;

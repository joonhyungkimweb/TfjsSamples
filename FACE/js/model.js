import { TRIANGULATION } from '../assets/triangulation.js'
/*global faceLandmarksDetection, Path2D*/

export const getModel = async() => {
    const model = await faceLandmarksDetection.load('mediapipe-facemesh', {
        modelUrl : './model/facemesh/model.json',
        detectorModelUrl : './model/detectorModel/model.json',
        irisModelUrl : './model/iris/model.json'
    });

    await model.estimateFaces({
        input: document.createElement('canvas')
    });

    return model;
};

export const predictRepeater = (canvas, video) => {
    const ctx = canvas.getContext('2d');

    const NUM_KEYPOINTS = 468;
    const NUM_IRIS_KEYPOINTS = 5;

    const drawPath = (points, closePath) => {
        const region = new Path2D();
        region.moveTo(points[0][0], points[0][1]);

        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            region.lineTo(point[0], point[1]);
        }

        if (closePath) {
            region.closePath();
        }

        ctx.stroke(region);
    };

    const distance = (a, b) => {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    };

    const drawIrisLeft = (scaledMesh) => {
        const leftCenter = scaledMesh[NUM_KEYPOINTS];
        const leftDiameterY = distance(
            scaledMesh[468 + 4],
            scaledMesh[468 + 2]);
        const leftDiameterX = distance(
            scaledMesh[NUM_KEYPOINTS + 3],
            scaledMesh[NUM_KEYPOINTS + 1]);

        ctx.beginPath();
        ctx.ellipse(leftCenter[0], leftCenter[1], leftDiameterX / 2, leftDiameterY / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
    };

    const drawIrisRight = (scaledMesh) => {
        const rightCenter = scaledMesh[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS];
        const rightDiameterY = distance(
            scaledMesh[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 2],
            scaledMesh[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 4]);
        const rightDiameterX = distance(
            scaledMesh[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 3],
            scaledMesh[NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS + 1]);

        ctx.beginPath();
        ctx.ellipse(rightCenter[0], rightCenter[1], rightDiameterX / 2, rightDiameterY / 2, 0, 0, 2 * Math.PI);
        ctx.stroke();
    };

    const drawFace = (frame, scaledMesh) => {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 0.5;

        for (let i = 0; i < TRIANGULATION.length / 3; i++) {
            const points = [
                TRIANGULATION[i * 3], TRIANGULATION[i * 3 + 1],
                TRIANGULATION[i * 3 + 2]
            ].map(index => scaledMesh[index]);

            drawPath(points, true);
        }

        if (scaledMesh.length > NUM_KEYPOINTS) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;

            drawIrisLeft(scaledMesh);

            if (scaledMesh.length > NUM_KEYPOINTS + NUM_IRIS_KEYPOINTS) {
                drawIrisRight(scaledMesh);
            }
        }
    };

    return async(recording) => {
        if (recording) {
            const frame = canvas.cloneNode();

            frame.getContext('2d').drawImage(video, 0, 0, video.width, video.height);

            const predictions = await window.model.estimateFaces({
                input: frame
            });

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

            predictions.forEach(({ scaledMesh }) => drawFace(frame, scaledMesh));
        }
        else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
    };
};
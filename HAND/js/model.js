/*global handpose Path2D*/
export const getModel = async() => {
    const model = await handpose.load();

    await model.estimateHands(document.createElement('canvas'));

    return model;
};

export const predictRepeater = (canvas, video) => {
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'green';
    ctx.fillStyle = 'red';

    let fingerLookupIndices = {
        thumb: [0, 1, 2, 3, 4],
        indexFinger: [0, 5, 6, 7, 8],
        middleFinger: [0, 9, 10, 11, 12],
        ringFinger: [0, 13, 14, 15, 16],
        pinky: [0, 17, 18, 19, 20]
    };

    const drawPoint = (y, x, r) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

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
    }

    const drawKeypoints = (keypoints) => {
        const keypointsArray = keypoints;

        for (let i = 0; i < keypointsArray.length; i++) {
            const y = keypointsArray[i][0];
            const x = keypointsArray[i][1];
            drawPoint(x - 2, y - 2, 3);
        }

        const fingers = Object.keys(fingerLookupIndices);
        for (let i = 0; i < fingers.length; i++) {
            const finger = fingers[i];
            const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
            drawPath(points, false);
        }
    }

    return async(recording) => {
        if (recording) {
            const frame = canvas.cloneNode();

            frame.getContext('2d').drawImage(video, 0, 0, video.width, video.height);

            const predictions = await window.model.estimateHands(frame);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

            if (predictions.length > 0) {
                const result = predictions[0].landmarks;
                drawKeypoints(result, predictions[0].annotations);
            }
        }
        else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
    };
};
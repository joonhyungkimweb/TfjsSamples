/*global posenet Path2D*/
export const getModel = async() => {
    const model = await posenet.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        inputResolution: { width: 350, height: 350 },
        multiplier: 0.75,
        modelUrl : './model/posenet/model.json'
    });

    await model.estimateMultiplePoses(document.createElement('canvas'), {
        maxDetections: 3
    });

    return model;
};

export const predictRepeater = (canvas, video) => {
    const ctx = canvas.getContext('2d');

    const drawKeypoints = (keypoints, ctx, index) => {

        for (let i = 0; i < keypoints.length; i++) {

            const keypoint = keypoints[i];

            if (keypoint.score < 0.5) {
                continue;
            }
            const { y, x } = keypoint.position;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = '#00FFFF';
            ctx.fill();
        }
    };

    const drawSkeleton = (keypoints, ctx, index) => {
        const adjacentKeyPoints =
            posenet.getAdjacentKeyPoints(keypoints, 0.6);

        const drawSegment = ([ay, ax], [by, bx], ctx) => {
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00FFFF';
            ctx.stroke();
        }

        adjacentKeyPoints.forEach((keypoints) => {
            const as = [keypoints[0].position.y, keypoints[0].position.x];

            const bs = [keypoints[1].position.y, keypoints[1].position.x];

            drawSegment(as, bs, ctx);

        });
    }


    return async(recording) => {
        if (recording) {
            const frame = canvas.cloneNode();

            frame.getContext('2d').drawImage(video, 0, 0, video.width, video.height);

            const predictions = await window.model.estimateMultiplePoses(frame, {
                maxDetections: 3
            });;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

            predictions.forEach((prediction, index) => {
                if (prediction.score > 0.1) {
                    drawKeypoints(prediction.keypoints, ctx, index);

                    drawSkeleton(prediction.keypoints, ctx, index);
                }
            })

        }
        else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
    };
};
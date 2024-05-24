/*global cocoSsd Path2D*/
export const getModel = async() => {

    const model = await cocoSsd.load({
        modelUrl : './model/cocossd/model.json'
    });

    await model.detect(document.createElement('canvas'));

    return model;
};

export const predictRepeater = (canvas, video) => {
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'rgba(0, 0, 255, 0.25)';
    ctx.font = '10px Arial';

    // DETECTION 위치 기반으로 캔버스 위에 DETECTION 사각형 그림 그리기 
    const drawDetection = (prediction) => {
        ctx.beginPath();
        ctx.rect(...prediction.bbox);
        ctx.lineWidth = 3;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';

        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.fillText(
            prediction.score.toFixed(3) + ' ' + prediction.class, prediction.bbox[0],
            prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
    }


    return async(recording) => {
        if (recording) {
            const frame = canvas.cloneNode();

            frame.getContext('2d').drawImage(video, 0, 0, video.width, video.height);

            const predictions = await window.model.detect(frame);;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

            predictions.forEach(prediction => drawDetection(prediction));

        }
        else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
    };
};
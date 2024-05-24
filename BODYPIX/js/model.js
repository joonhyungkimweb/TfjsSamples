const options = {
    outputStride: 8, // 8, 16, or 32, default is 16
    segmentationThreshold: 0.3 // 0 - 1, defaults to 0.5 
}


export const getModel = async() => {
    const model = await ml5.bodyPix(options)

    return model;
};

export const predictRepeater = (canvas, video) => {
    const ctx = canvas.getContext('2d');
    const overlay = document.querySelector('.overlay-canvas');
    const overlayCtx = overlay.getContext('2d');

    const imageDataToCanvas = (imageData, x, y) => {
        // console.log(raws, x, y)
        const arr = Array.from(imageData)

        canvas.width = x;
        canvas.height = y;

        const imgData = ctx.createImageData(x, y);
        const { data } = imgData;

        for (let i = 0; i < x * y * 4; i += 1) data[i] = arr[i];
        
        ctx.putImageData(imgData, 0, 0);

        return ctx.canvas;
    };

    const gotImage = (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
        const maskBackground = imageDataToCanvas(result.raw.backgroundMask.data, result.raw.backgroundMask.width, result.raw.backgroundMask.height)
        overlayCtx.drawImage(maskBackground, 0, 0, overlay.width, overlay.height);
    }

    return async(recording) => {
        if (recording) {
            ctx.drawImage(video, 0, 0, video.width, video.height);

            await window.model.segment(canvas, gotImage, options);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        }
        else {
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
    };
};
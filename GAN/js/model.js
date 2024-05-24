/*global tf Path2D*/
export const getModel = async() => {

    const model = await tf.loadGraphModel("./model/gan/model.json");

    model.predict(tf.zeros([1, 256, 256, 3]));

    return model;
};

export const predictRepeater = (canvas, video) => {
    const ctx = canvas.getContext('2d');

    const convertData = (frame) => {
        return tf.tidy(() => {
            const image_tensor = tf.browser.fromPixels(frame);

            const resized_tensor = tf.image.resizeBilinear(image_tensor, [256, 256]);

            return tf.stack([resized_tensor.sub(tf.scalar(127.5)).div(tf.scalar(127.5))]);
        });
    }

    // draw

    const drawData = (result) => {
        let img_out = result.squeeze().sub(tf.scalar(-1)).div(tf.scalar(2)).clipByValue(0, 1);

        tf.browser.toPixels(tf.image.resizeBilinear(img_out, [canvas.width, canvas.height]), canvas);
    }


    return async(recording) => {
        if (recording) {
            const frame = canvas.cloneNode();

            frame.getContext('2d').drawImage(video, 0, 0, video.width, video.height);

            const result = window.model.predict(convertData(frame));

            drawData(result);
        }
        else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
    };
};
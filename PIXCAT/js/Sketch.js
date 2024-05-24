const drawingCanvas = document.querySelector('.drawing-canvas');
const resultCanvas = document.querySelector('.result-canvas');
drawingCanvas.width = drawingCanvas.clientWidth;
drawingCanvas.height = drawingCanvas.clientHeight;
resultCanvas.width = resultCanvas.clientWidth;
resultCanvas.height = resultCanvas.clientHeight;
let model;

const fillCanvas = (canvas) => {
    canvas.getContext('2d').fillStyle = "#ffffff";
    canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
}

const initCanvas = (canvas) => {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "black";
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;

    fillCanvas(canvas);

    const drawingParams = { x: null, y: null, isDrawing: false };

    const drawLine = ({ x, y }) => {
        ctx.beginPath();
        ctx.moveTo(drawingParams.x, drawingParams.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const getNewXY = (e) => {
        const rect = canvas.getBoundingClientRect();

        const xy = {};

        if (e instanceof MouseEvent) {
            xy.x = e.offsetX;
            xy.y = e.offsetY;
        }

        if (e instanceof TouchEvent) {
            xy.x = e.touches[0].clientX - rect.left;
            xy.y = e.touches[0].clientY - rect.top;
        }

        return xy;
    };

    const setXY = ({ x, y }) => {
        drawingParams.x = x;
        drawingParams.y = y;
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setXY(getNewXY(e));
        drawingParams.isDrawing = true;
    };

    const keepDrawing = (e) => {
        e.preventDefault();
        if (drawingParams.isDrawing) {
            const newXy = getNewXY(e);
            drawLine(newXy);
            setXY(newXy);
        }
        else {
            return;
        }
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        const pred = predict(drawingCanvas);
        tf.toPixels(pred, resultCanvas)
        drawingParams.isDrawing = false;
    };

    canvas.onmousedown = startDrawing;
    canvas.ontouchstart = startDrawing;

    canvas.onmousemove = keepDrawing;
    canvas.ontouchmove = keepDrawing;

    canvas.onmouseup = stopDrawing;
    canvas.ontouchend = stopDrawing;

    document.querySelector('#erase-button').onclick = () => {
        fillCanvas(drawingCanvas);
        fillCanvas(resultCanvas);
    };
};

/*
get the prediction 
*/
function predict(imgData) {
    return tf.tidy(() => {
        //get the prediction 
        const gImg = model.predict(preprocess(imgData))
        //post process 
        const postImg = postprocess(gImg)
        return postImg
    })
}

/*
preprocess the data
*/
function preprocess(imgData) {
    return tf.tidy(() => {
        //convert to a tensor 
        const tensor = tf.fromPixels(imgData).toFloat()
        //resize 
        const resized = tf.image.resizeBilinear(tensor, [256, 256])
        //normalize 
        const offset = tf.scalar(127.5);
        const normalized = resized.div(offset).sub(tf.scalar(1.0));
        //We add a dimension to get a batch shape 
        const batched = normalized.expandDims(0)
        return batched
    })
}

/*
post process 
*/
function postprocess(tensor) {
    const { width: w, height: h } = resultCanvas
    return tf.tidy(() => {
        //normalization factor  
        const scale = tf.scalar(0.5);

        //unnormalize and sqeeze 
        const squeezed = tensor.squeeze().mul(scale).add(scale)

        //resize to canvas size 
        const resized = tf.image.resizeBilinear(squeezed, [w, h])

        return resized
    })

}

function populateInitImage() {

    return new Promise((res) => {
        const imgData = new Image;
        imgData.onload = () => {
            drawingCanvas.getContext('2d').drawImage(imgData, 0, 0, drawingCanvas.width, drawingCanvas.height);
            const pred = predict(imgData);
            tf.toPixels(pred, resultCanvas)
            res();
        }

        imgData.src = 'cat.png'
    })

}


export async function setup() {

    initCanvas(drawingCanvas);

    model = await tf.loadModel('models/cats_model2/model.json');

    await populateInitImage();
}

export function toggleLoading(value) {
    document.querySelector('.loading-comp').setAttribute('data-loaded', value)
}

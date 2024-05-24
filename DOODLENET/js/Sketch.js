const getPercentage = (data) => {
    return ((data || 0) * 100).toFixed(1);
}

const sortAndSliceData = (datas) => {
    return datas.sort((data1, data2) => data2.value - data1.value).slice(0, 2);
};

let classifier;

let request;

// A variable to hold the canvas image we want to classify
let canvas, ctx;

// Two variable to hold the label and confidence of the result
const resultComps = [document.getElementById('result-1'), document.getElementById('result-2')];
const resultLabels = [document.getElementById('result-label-1'), document.getElementById('result-label-2')];
const resultPercentages = [document.getElementById('result-percentage-1'), document.getElementById('result-percentage-2')];

let eraseButton;
let width;
let height;
let lineWidth;

let pX = null;
let pY = null;
let x = null;
let y = null;

let mouseDown = false;

export async function setup() {
    canvas = document.querySelector(".drawing-canvas");
    width = canvas.clientWidth;
    height = canvas.clientHeight
    canvas.width = width;
    canvas.height = height;
    lineWidth = width > 400 ? 20 : 15;
    ctx = canvas.getContext("2d");

    classifier = await ml5.imageClassifier("DoodleNet", onModelReady);
    // Create a canvas with 280 x 280 px

    canvas.addEventListener("mousemove", onMouseUpdate);
    canvas.addEventListener("touchmove", onMouseUpdate);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("touchstart", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchend", onMouseUp);

    // Create a clear canvas button
    eraseButton = document.querySelector("#erase-button");

    eraseButton.addEventListener("click", clearCanvas);
}

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

const setXY = ({ x: newX, y: newY }) => {
    x = newX;
    y = newY;
};

function onModelReady() {
    console.log("ready!");
}

function clearCanvas() {
    ctx.fillStyle = "#dee2e6";
    ctx.fillRect(0, 0, width, height);
}

function draw() {

    if (pX == null || pY == null) {
        pX = x;
        pY = y;
    }

    // Set stroke weight to 10
    ctx.lineWidth = lineWidth;
    // Set stroke color to black
    ctx.strokeStyle = "#000000";
    // If mouse is pressed, draw line between previous and current mouse positions
    if (mouseDown === true) {
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.moveTo(x, y);
        ctx.lineTo(pX, pY);
        ctx.stroke();
    }

    pX = x;
    pY = y;
}

function onMouseDown(e) {
    e.preventDefault()
    mouseDown = true;

    setXY(getNewXY(e));

    pX = null;
    pY = null;
}

function onMouseUp(e) {
    e.preventDefault()
    mouseDown = false;
    classifyCanvas();
}

function onMouseUpdate(e) {
    e.preventDefault()
    const pos = getMousePos(e);
    x = pos.x;
    y = pos.y;
    draw();
}

function getMousePos(e) {
    return getNewXY(e);
}

function classifyCanvas() {
    classifier.classify(canvas, gotResult);
}

// A function to run when we get any errors and the results
function gotResult(error, results) {
    // Display error in the console
    if (error) {
        console.error(error);
    }
    // The results are in an array ordered by confidence.
    const sortedResults = sortAndSliceData(results);
    // Show the first label and confidence
    resultComps.map((comp, index) => {
        const { label, confidence } = sortedResults[index];
        comp.style.width = `${getPercentage(confidence)}%`;
        resultLabels[index].innerHTML = `${label}`
        resultPercentages[index].innerHTML = `${getPercentage(confidence)}%`
    });

}

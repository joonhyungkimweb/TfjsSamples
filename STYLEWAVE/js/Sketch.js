const uploadCanvas = document.querySelector('.upload-canvas');
const resultCanvas = document.querySelector('.result-canvas');
uploadCanvas.width = uploadCanvas.clientWidth;
uploadCanvas.height = uploadCanvas.clientHeight;
resultCanvas.width = resultCanvas.clientWidth;
resultCanvas.height = resultCanvas.clientHeight
const fileInput = document.querySelector('input');
const fileLabel = document.querySelector('.file-input-label-container');

let model;
fileInput.addEventListener('change', ({ target: { files } }) => {
    if (files.length > 0) {
        const reader = new FileReader();

        reader.onload = ({ target: { result } }) => {
            const image = document.createElement("img");

            image.onload = async() => {
                drawCanvas(uploadCanvas, image);

                toggleLoading(false);

                const resizedImage = await resizeImage(image, { width: 224, height: 224 });
                const transferResult = await transferImage(resizedImage);

                toggleLoading(true);

                drawCanvas(resultCanvas, transferResult);

                fileLabel.classList.add('image-uploaded');
            }

            image.src = result;

        }

        reader.readAsDataURL(files[0]);
    }

})

function resizeImage(image, { width, height }) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height)

    return new Promise((res) => {
        const resizedImage = new Image();

        resizedImage.onload = () => {
            res(resizedImage);
        }

        resizedImage.src = canvas.toDataURL('image/jpeg');
    })
}

function drawCanvas(canvas, image) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

export async function setup() {
    model = await ml5.styleTransfer('models/wave')
}

export function toggleLoading(value) {
    document.querySelector('.loading-comp').setAttribute('data-loaded', value)
}

async function transferImage(input) {
    return await model.transfer(input);
}

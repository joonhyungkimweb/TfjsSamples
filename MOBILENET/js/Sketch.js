const sortAndSliceData = (datas) => {
    return datas.sort((data1, data2) => data2.value - data1.value).slice(0, 2);
};

const getPercentage = (data) => {
    return ((data || 0) * 100).toFixed(1);
}
let classifier;

const canvas = document.querySelector('.image-canvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight
const fileInput = document.querySelector('input');
const fileLabel = document.querySelector('.file-input-label-container');
const resultComps = [document.getElementById('result-1'), document.getElementById('result-2')];
const resultLabels = [document.getElementById('result-label-1'), document.getElementById('result-label-2')];
const resultPercentages = [document.getElementById('result-percentage-1'), document.getElementById('result-percentage-2')];

fileInput.addEventListener('change', ({ target: { files } }) => {
    if (files.length > 0) {
        const reader = new FileReader();

        reader.onload = ({ target: { result } }) => {
            const image = document.createElement("img");

            image.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                fileLabel.classList.add('image-uploaded');
                classify();
            }

            image.src = result;

        }

        reader.readAsDataURL(files[0]);
    }

})

export async function setup() {
    classifier = await ml5.imageClassifier('MobileNet')
}

async function classify() {
    const results = sortAndSliceData(await classifier.classify(canvas));

    resultComps.map((comp, index) => {
        const { label, confidence } = results[index];
        comp.style.width = `${getPercentage(confidence)}%`;
        resultLabels[index].innerHTML = `${label}`
        resultPercentages[index].innerHTML = `${getPercentage(confidence)}%`
    });
    
}
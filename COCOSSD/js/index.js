import { WebCamPreview } from '../components/WebCamPreview.js';
import { ResultCanvas } from '../components/ResultCanvas.js';
import { getModel } from './model.js';

const loadingProgress = (interval) => {
    let timer;
    const loadingSpan = document.createElement('span');
    loadingSpan.innerText = "0%";
    document.querySelector('.loading-comp').appendChild(loadingSpan);
    let percentage = 0;

    timer = setInterval(() => {
        const proceed = Math.floor(Math.random() * 10);
        loadingSpan.innerText = `${percentage + proceed < 99 ? percentage += proceed : percentage }%`
    }, interval)

    return {
        end: () => {
            clearInterval(timer);
            loadingSpan.innerText = "100%";
        }
    }
}

window.onload = async() => {
    try {
        const loading = loadingProgress(500)
        window.model = await getModel();
        
        const webcam = new WebCamPreview({
            videoElement: document.querySelector('.webcam-preview'),
            canvasElement: document.querySelector('.result-canvas'),
            startButton: document.querySelector('#start-button'),
            stopButton: document.querySelector('#stop-button'),
            flipButton: document.querySelector('#flip-button')
        });
        
        await webcam.initVideo();
        
        new ResultCanvas({
            canvasElement: document.querySelector('.result-canvas'),
            videoElement: webcam.video
        });
        
        loading.end();
    }
    catch (e) {
        alert(e);
    }
}

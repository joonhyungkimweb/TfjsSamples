import { setup, toggleLoading } from './Sketch.js';

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
            toggleLoading(true);
        }
    }
}

window.onload = async() => {
    try {
        const loading = loadingProgress(1000);
        await setup();
        loading.end()
    }
    catch (err) {
        alert(err)
    }
}

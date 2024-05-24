import { predictRepeater } from '../js/model.js'

export class ResultCanvas {
    constructor({ canvasElement, videoElement }) {
        this.canvasElement = canvasElement;
        this.videoElement = videoElement;
        this.canvasElement.width = this.videoElement.width;
        this.canvasElement.height = this.videoElement.height;

        this.recording = false;
        this.addEvents();

        this.startPreview();
    }

    addEvents() {
        this.canvasElement.addEventListener('recordstart', () => {
            this.recording = true;
        });

        this.canvasElement.addEventListener('recordend', () => {
            this.recording = false;
        });
    }

    startPreview() {
        const repeater = predictRepeater(this.canvasElement, this.videoElement);

        const repeat = async() => {

            try {
                await repeater(this.recording);
                requestAnimationFrame(repeat);
            }
            catch (err) {
                alert(err)
            }

        };

        repeat();
    }
}

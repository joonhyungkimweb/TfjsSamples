/* global navigator, CustomEvent */
export class WebCamPreview {
    constructor({ videoElement, canvasElement, startButton, stopButton, flipButton, overlayCanvas }) {
        this.video = videoElement;
        
        this.canvas = canvasElement;
        
        this.overlay = overlayCanvas;
        
        this.startButton = startButton;
        this.stopButton = stopButton;
        this.flipButton = flipButton;
        this.facingMode = "user";
        this.addEvents();
    }

    async initVideo() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.facingMode,
                    resizeMode: "crop-and-scale",
                    aspectRatio: 1
                }
            });

            const { width, height } = stream.getVideoTracks()[0].getSettings();

            if (stream.getVideoTracks()[0].getCapabilities().facingMode[0] == "environment") {
                this.canvas.classList.remove('flip-canvas');
                this.overlay.classList.remove('flip-canvas');
            }
            else {
                this.canvas.classList.add('flip-canvas');
                this.overlay.classList.add('flip-canvas');
            }

            if (window.matchMedia('(orientation: portrait)').matches) {
                this.video.width = height;
                this.video.height = width;
            }
            else {
                this.video.width = width;
                this.video.height = height;
            }
            
            this.video.srcObject = stream;
        }
    }

    addEvents() {
        this.startButton.onclick = () => {
            document.querySelector('.result-canvas').dispatchEvent(new CustomEvent('recordstart'));
            this.startButton.setAttribute('disabled', true);
            this.stopButton.removeAttribute('disabled');
        };

        this.stopButton.onclick = () => {
            document.querySelector('.result-canvas').dispatchEvent(new CustomEvent('recordend'));
            this.stopButton.setAttribute('disabled', true);
            this.startButton.removeAttribute('disabled');
        }

        this.flipButton.onclick = async() => {
            this.facingMode = this.facingMode === "user" ? "environment" : "user";
            this.initVideo();
        }
    }
}
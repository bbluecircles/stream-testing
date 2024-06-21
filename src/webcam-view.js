const debounce = (callback, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback.apply(this, args)
        }, delay);
    }
}

class WebcamView {
    constructor() {
        this._isActive = false;
        this._hasError = false;
        this._mediaRecorder = null;

        this._video = document.getElementById('video');
        this._recordedVideo = document.getElementById('recordedVideo');
        this._webcamViewElement = document.querySelector('.webcam-view');

        this._recordedChunks = [];

        this._init();
    }

    _disableCamera = () => {
        const disableCameraButton = document.querySelector('.js-disable-camera');

        disableCameraButton.setAttribute('disabled', true);
        console.info('Disabling webcam...');
        this._webcamViewElement.classList.remove('webcam-active');
        this._mediaRecorder.stop();
    }

    _setVideoElementSize = () => {
        const webcamView = document.querySelector('.webcam-view');
        const visibleVideo = document.getElementById('video');
        const hiddenVideo = document.getElementById('recordedVideo');
        const visibleWrapper = visibleVideo.parentElement;

        if (!webcamView) return;

        let { width, height } = webcamView.getBoundingClientRect();

        width = width - (16 * 2);
        height = height - (16 * 2);

        visibleVideo.setAttribute('width', `${width}px`);
        visibleVideo.setAttribute('height', `${height}px`);

        hiddenVideo.setAttribute(`width`, `${width}px`);
        hiddenVideo.setAttribute('height', `${height}px`);
        
    }

    _enableCamera = () => {
        const disableCameraButton = document.querySelector('.js-disable-camera');

        console.info('Enabling webcam...');

        disableCameraButton.removeAttribute('disabled');

        this._webcamViewElement.classList.add('webcam-active');

        navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            try {
                console.log('Stream: ', stream)
                this._video.srcObject = stream;
    
                this._mediaRecorder = new MediaRecorder(stream);
    
                this._mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        this._recordedChunks.push(event.data);
                    }
                }
    
                this._mediaRecorder.onstop = () => {
                    const blob = new Blob(this._recordedChunks, { type: 'video/webm' });
                    this._recordedChunks = [];
                    const url = URL.createObjectURL(blob);
                    this._recordedVideo.src = url;
                }

                this._mediaRecorder.start();

            } catch(e) {
                console.error(e)
            }
        })

    }

    _applyEventsToElements = () => {
        const enableCameraButton = document.querySelector('.js-enable-camera');
        const disableCameraButton = document.querySelector('.js-disable-camera');

        enableCameraButton.addEventListener('click', this._enableCamera);
        disableCameraButton.addEventListener('click', this._disableCamera);

        window.addEventListener('resize', debounce(this._setVideoElementSize, 200))
    }
    
    _init = () => {
        this._applyEventsToElements();
        this._setVideoElementSize();
    }
}

export default WebcamView
class WebcamView {
    constructor() {
        this._isActive = false;
        this._hasError = false;
        this._mediaRecorder = null;

        this._video = document.getElementById('video');
        this._recordedVideo = document.getElementById('recordedVideo');
        this._webcamViewElement = document.querySelector('.webcam-view');

        this._recordedChunks = {};

        this._init();
    }

    _disableCamera = () => {
        console.info('Disabling webcam...');
        this._webcamViewElement.classList.remove('webcam-active');
        this._mediaRecorder.stop();
    }

    _enableCamera = () => {
        console.info('Enabling webcam...');

        this._webcamViewElement.classList.add('webcam-active');


        this._mediaRecorder.start();
    }

    _applyEventsToElements = () => {
        const enableCameraButton = document.querySelector('.js-enable-camera');
        const disableCameraButton = document.querySelector('.js-disable-camera');

        enableCameraButton.addEventListener('click', this._enableCamera);
        disableCameraButton.addEventListener('click', this._disableCamera);
    }

    _init = () => {
        this._applyEventsToElements();
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

            } catch(e) {
                console.error(e)
            }
        })
    }
}

export default WebcamView
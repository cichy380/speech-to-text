import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable()
export class AudioRecordingService {

    public audioBlob$: Subject<Blob> = new Subject();

    private mediaRecorder!: MediaRecorder;
    private audioContext!: AudioContext;
    private audioAnalyser!: AnalyserNode;
    private scriptNode!: AudioNode;
    private recordedChunks: Blob[] = [];
    private readonly silenceThreshold = 0.2;
    private readonly silenceDuration = 1000;
    private silenceStartTime: number | null = null;
    private stream!: MediaStream;

    constructor(
        private ngZone: NgZone,
    ) {
    }

    startRecording() {
        this.audioContext = new AudioContext();
        this.audioAnalyser = this.audioContext.createAnalyser();
        this.scriptNode = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.silenceStartTime = null;

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.stream = stream;
            const sourceNode = this.audioContext.createMediaStreamSource(stream);
            sourceNode.connect(this.audioAnalyser);
            this.audioAnalyser.connect(this.scriptNode);
            this.scriptNode.connect(this.audioContext.destination);

            // @ts-ignore
            this.scriptNode.onaudioprocess = () => {
                const array = new Uint8Array(this.audioAnalyser.frequencyBinCount);
                this.audioAnalyser.getByteFrequencyData(array);

                const average = this.getAverageVolume(array);

                if (average < this.silenceThreshold) {
                    if (this.silenceStartTime === null) {
                        this.silenceStartTime = Date.now();
                    } else if (Date.now() - this.silenceStartTime > this.silenceDuration) {
                        this.stopRecording();
                    }
                } else {
                    this.silenceStartTime = null;
                }
            };

            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.start();
            this.mediaRecorder.ondataavailable = (event) => {
                this.recordedChunks.push(event.data);
            };
        });
    }

    stopRecording() {
        this.mediaRecorder.onstop = async () => {
            await this.ngZone.run(async () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
                this.recordedChunks = [];
                await this.audioContext.close();
                this.stream.getTracks().forEach(track => track.stop());
                this.audioBlob$.next(blob);
            });
        };
        this.mediaRecorder.stop();
    }

    private getAverageVolume(array: Uint8Array) {
        let values = 0;
        array.forEach(item => values += item);
        return values / array.length;
    }
}

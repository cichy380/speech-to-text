import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {

  private mediaRecorder!: MediaRecorder;
  private audioContext!: AudioContext;
  private audioAnalyser!: AnalyserNode;
  private scriptNode!: ScriptProcessorNode | AudioWorkletNode;
  private recordedChunks: Blob[] = [];
  private silenceThreshold = 0.2; // Wartość w decybelach, regulacji według potrzeb
  private silenceDuration = 1000; // Czas trwania ciszy w milisekundach
  private silenceStartTime: number | null = null;

  startRecording(stopRecordingCallback: (audioBlob: Blob) => void) {
    this.audioContext = new AudioContext();
    this.audioAnalyser = this.audioContext.createAnalyser();
    this.scriptNode = this.audioContext.createScriptProcessor(4096, 1, 1);

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
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
            this.stopRecording().then(audioBlob => stopRecordingCallback(audioBlob));
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
    return new Promise<Blob>((resolve, reject) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'audio/wav',
        });
        this.recordedChunks = [];
        this.audioContext.close();
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  private getAverageVolume(array: Uint8Array) {
    let values = 0;
    let average;

    const length = array.length;

    for (let i = 0; i < length; i++) {
      values += array[i];
    }

    average = values / length;
    return average;
  }
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {

  private mediaRecorder!: MediaRecorder;
  private audioContext!: AudioContext;
  private audioAnalyser!: AnalyserNode;
  private audioWorkletNode!: AudioWorkletNode;
  private scriptNode!: AudioNode;
  private recordedChunks: Blob[] = [];
  private readonly silenceThreshold = 0.2;
  private readonly silenceDuration = 1000;
  private silenceStartTime: number | null = null;
  private stream!: MediaStream;

  startRecording(stopRecordingCallback: (audioBlob: Blob) => void) {
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

  // startRecording(stopRecordingCallback: (audioBlob: Blob) => void) {
  //   this.audioContext = new AudioContext();
  //   this.audioContext.audioWorklet.addModule('assets/audio-worklet-processor.js').then(() => {
  //     this.audioAnalyser = this.audioContext.createAnalyser();
  //     this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audioWorkletProcessor');
  //
  //     navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  //       const sourceNode = this.audioContext.createMediaStreamSource(stream);
  //       sourceNode.connect(this.audioAnalyser);
  //       this.audioAnalyser.connect(this.audioWorkletNode);
  //       // this.audioWorkletNode.connect(this.audioContext.destination);
  //
  //       this.audioWorkletNode.port.onmessage = (event) => {
  //         const average = this.getAverageVolume(event.data.volumeArray);
  //
  //         if (average < this.silenceThreshold) {
  //           if (this.silenceStartTime === null) {
  //             this.silenceStartTime = Date.now();
  //           } else if (Date.now() - this.silenceStartTime > this.silenceDuration) {
  //             // this.stopRecording();
  //             this.stopRecording().then(audioBlob => stopRecordingCallback(audioBlob));
  //           }
  //         } else {
  //           this.silenceStartTime = null;
  //         }
  //       };
  //
  //       this.mediaRecorder = new MediaRecorder(stream);
  //       this.mediaRecorder.start();
  //       this.mediaRecorder.ondataavailable = (event) => {
  //         this.recordedChunks.push(event.data);
  //       };
  //     });
  //   });
  // }

  stopRecording() {
    return new Promise<Blob>((resolve, _reject) => {
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
        this.recordedChunks = [];
        await this.audioContext.close();
        this.stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  private getAverageVolume(array: Uint8Array) {
    let values = 0;
    array.forEach(item => values += item);
    return values / array.length;
  }
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {

  private mediaRecorder!: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private stream!: MediaStream;

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
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
        this.stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}

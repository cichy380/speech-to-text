import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioRecordingService {

  private mediaRecorder!: MediaRecorder;
  private recordedChunks: Blob[] = [];

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
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
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
}

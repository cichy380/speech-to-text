import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AudioRecordingService } from './audio-recording.service';
import { AudioProcessingService } from './audio-processing.service';
import { MicIconComponent } from './mic-icon/mic-icon.component';
import { SpinnerIconComponent } from './spinner-icon/spinner-icon.component';


@Component({
  selector: 'app-root',
  standalone: true,
    imports: [CommonModule, HttpClientModule, MicIconComponent, SpinnerIconComponent],
  providers: [AudioProcessingService, AudioRecordingService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  isRecording = false;
  isConverting = false;

  text = '';

  constructor(
    private readonly audioRecordingService: AudioRecordingService,
    private readonly audioProcessingService: AudioProcessingService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  startRecording() {
    this.text = '';
    this.isRecording = true;
    this.audioRecordingService.startRecording(audioBlob => {
      this.isRecording = false;
      this.isConverting = true;
      this.changeDetectorRef.detectChanges();
      this.audioProcessingService.sendAudio(audioBlob)
          .subscribe(transcription => {
            this.isConverting = false;
            this.text = transcription;
            this.changeDetectorRef.detectChanges();
          });
    });
  }

  async stopRecording() {
    this.isRecording = false;
    this.isConverting = true;
    this.audioRecordingService.stopRecording()
      .then(audioBlob => {
        this.audioProcessingService.sendAudio(audioBlob)
          .subscribe(transcription => {
            this.isConverting = false;
            this.text = transcription;
          });
      });
  }

}

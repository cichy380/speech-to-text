import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AudioRecordingService } from './audio-recording.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  constructor(private audioRecordingService: AudioRecordingService) {
  }

  startRecording() {
    this.audioRecordingService.startRecording();
  }

  async stopRecording() {
    const audioBlob = await this.audioRecordingService.stopRecording();
    // Do something with audioBlob
  }
}

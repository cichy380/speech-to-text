import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AudioRecordingService } from './audio-recording.service';
import { AudioProcessingService } from './audio-processing.service';
import { MicIconComponent } from './mic-icon/mic-icon.component';
import { SpinnerIconComponent } from './spinner-icon/spinner-icon.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, HttpClientModule, FormsModule, MicIconComponent, SpinnerIconComponent, SkeletonLoaderComponent],
    providers: [AudioProcessingService, AudioRecordingService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

    isRecording = false;
    isConverting = false;
    text = '';
    language = 'en-US';

    constructor(
        private readonly audioRecordingService: AudioRecordingService,
        private readonly audioProcessingService: AudioProcessingService,
        private readonly changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit() {
        this.observeAudioBlob();
    }

    startRecording() {
        this.isRecording = true;
        this.isConverting = false;
        this.text = '';
        this.changeDetectorRef.detectChanges();
        this.audioRecordingService.startRecording();
    }

    stopRecording() {
        this.audioRecordingService.stopRecording();
    }

    private observeAudioBlob() {
        this.audioRecordingService.audioBlob$
            .subscribe(audioBlob => {
                this.isRecording = false;
                this.isConverting = true;
                this.changeDetectorRef.detectChanges();
                this.sendAudioForTranscription(audioBlob);
            });
    }

    private sendAudioForTranscription(audio: Blob) {
        this.audioProcessingService.sendAudio(audio, this.language)
            .subscribe(transcription => {
                this.isConverting = false;
                this.text = transcription;
                this.changeDetectorRef.detectChanges();
            });
    }
}

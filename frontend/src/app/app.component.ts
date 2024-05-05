import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AudioRecordingService } from './audio-recording.service';
import { AudioProcessingService } from './audio-processing.service';
import { MicIconComponent } from './mic-icon/mic-icon.component';
import { SpinnerIconComponent } from './spinner-icon/spinner-icon.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';


const MAX_RECORDING_TIME = 6000;


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
    recordingTimeoutId!: ReturnType<typeof setTimeout>;

    constructor(
        private readonly audioRecordingService: AudioRecordingService,
        private readonly audioProcessingService: AudioProcessingService,
    ) {
    }

    ngOnInit() {
        this.observeAudioBlob();
    }

    onStartRecordingButtonClick() {
        this.isRecording = true;
        this.isConverting = false;
        this.text = '';
        this.audioRecordingService.startRecording();
        this.startWatchingRecordingTime();
    }

    onStopRecordingButtonClick() {
        this.audioRecordingService.stopRecording();
        this.stopWatchingRecordingTime();
    }

    private observeAudioBlob() {
        this.audioRecordingService.audioBlob$
            .subscribe(audioBlob => {
                this.isRecording = false;
                this.sendAudioForTranscription(audioBlob);
            });
    }

    private sendAudioForTranscription(audio: Blob) {
        this.isConverting = true;
        this.audioProcessingService.sendAudio(audio, this.language)
            .subscribe(transcription => {
                this.isConverting = false;
                this.text = transcription;
            });
    }

    private startWatchingRecordingTime() {
        this.recordingTimeoutId = setTimeout(
            () => this.audioRecordingService.stopRecording(),
            MAX_RECORDING_TIME
        )
    }

    private stopWatchingRecordingTime() {
        clearInterval(this.recordingTimeoutId);
    }
}

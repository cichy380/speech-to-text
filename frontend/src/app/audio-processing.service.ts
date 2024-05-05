import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';


@Injectable()
export class AudioProcessingService {

    constructor(
        private http: HttpClient,
    ) {
    }

    public sendAudio(blob: Blob, language: string) {
        const formData = new FormData();
        formData.append('audio', blob);
        formData.append('language', language);
        return this.http.post<string>(
            environment.apiUrl + '/transcribe',
            formData,
            { responseType: 'text' as 'json' }
        );
    }
}

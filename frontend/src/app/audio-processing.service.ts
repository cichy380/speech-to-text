import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable()
export class AudioProcessingService {

    constructor(
        private http: HttpClient,
    ) {
    }

    public sendAudio(blob: Blob, language: string): Observable<string> {
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

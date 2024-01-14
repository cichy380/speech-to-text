import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class AudioProcessingService {
  private readonly serverUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {
  }

  public sendAudio(blob: Blob): Observable<string> {
    const formData = new FormData();
    formData.append('audio', blob);
    return this.http.post<string>(this.serverUrl + '/transcribe', formData, {responseType: 'text' as 'json'});
  }
}

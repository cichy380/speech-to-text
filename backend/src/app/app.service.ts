import { Injectable } from '@nestjs/common';
import { SpeechClient } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import IRecognizeRequest = google.cloud.speech.v1.IRecognizeRequest;


@Injectable()
export class AppService {

  private readonly client: SpeechClient;

  constructor() {
    this.client = new SpeechClient({
      keyFilename: 'speech-to-text-01-411118-01d4c048f21b.json'
    });
  }

  async transcribeAudio(buffer: Buffer) {
    const audio = { content: buffer };
    const config = {
      encoding: 'audio/wav',
      sampleRateHertz: 48000,
      languageCode: 'pl-PL',
    };
    const request = { config, audio };
    const [response] = await this.client.recognize(request as IRecognizeRequest);

    return response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
  }
}

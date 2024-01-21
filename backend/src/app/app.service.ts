import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechClient } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import IRecognizeRequest = google.cloud.speech.v1.IRecognizeRequest;


@Injectable()
export class AppService {

    private readonly client: SpeechClient;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.client = new SpeechClient({
            credentials: {
                type: configService.get('GOOGLE_CLOUD_SPEECH__CREDENTIALS__TYPE'),
                client_email: configService.get('GOOGLE_CLOUD_SPEECH__CREDENTIALS__CLIENT_EMAIL'),
                private_key: Buffer.from(configService.get<string>('GOOGLE_CLOUD_SPEECH__CREDENTIALS__PRIVATE_KEY'), 'base64').toString('utf8'),
                private_key_id: configService.get('GOOGLE_CLOUD_SPEECH__CREDENTIALS__PRIVATE_KEY_ID'),
                project_id: configService.get('GOOGLE_CLOUD_SPEECH__CREDENTIALS__PROJECT_ID'),
                client_id: configService.get('GOOGLE_CLOUD_SPEECH__CREDENTIALS__CLIENT_ID'),
                universe_domain: configService.get('GOOGLE_CLOUD_SPEECH__CREDENTIALS__UNIVERSE_DOMAIN'),
            }
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

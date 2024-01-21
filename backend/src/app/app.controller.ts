import { BadRequestException, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';


@Controller()
export class AppController {

    constructor(
        private readonly appService: AppService,
    ) {
    }

    @Post('transcribe')
    @UseInterceptors(FileInterceptor('audio'))
    @HttpCode(200)
    async transcribe(@UploadedFile() file) {
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        return await this.appService.transcribeAudio(file.buffer);
    }

}

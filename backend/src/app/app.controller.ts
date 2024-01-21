import { BadRequestException, Body, Controller, HttpCode, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { FileDto } from './dto/file.dto';
import { TranscribeDto } from './dto/transcribe.dto';


@Controller()
export class AppController {

    constructor(
        private readonly appService: AppService,
    ) {
    }

    @Post('transcribe')
    @UseInterceptors(FileInterceptor('audio'))
    @HttpCode(200)
    async transcribe(@UploadedFile() fileDto: FileDto, @Body() transcribeDto: TranscribeDto) {
        if (!fileDto) {
            throw new BadRequestException('No file uploaded.');
        }
        return await this.appService.transcribeAudio(fileDto.buffer, transcribeDto.language);
    }
}

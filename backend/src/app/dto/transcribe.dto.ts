import { IsNotEmpty, IsString } from 'class-validator';


export class TranscribeDto {

    @IsString()
    @IsNotEmpty()
    readonly language: string;
}

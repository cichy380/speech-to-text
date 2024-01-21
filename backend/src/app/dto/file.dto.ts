import { IsNotEmpty, IsNumber, IsString } from 'class-validator';


export class FileDto {

    @IsString()
    @IsNotEmpty()
    readonly fieldname: string;

    @IsString()
    @IsNotEmpty()
    readonly originalname: string;

    @IsString()
    @IsNotEmpty()
    readonly encoding: string;

    @IsString()
    @IsNotEmpty()
    readonly mimetype: string;

    @IsNotEmpty()
    readonly buffer: Buffer;

    @IsNumber()
    @IsNotEmpty()
    readonly size: number;
}

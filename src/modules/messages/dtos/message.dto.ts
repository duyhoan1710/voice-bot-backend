import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class MessageRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  content: string;
}

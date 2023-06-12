import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

@Exclude()
export class RoomRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;
}

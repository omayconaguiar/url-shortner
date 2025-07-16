import {PartialType, ApiProperty} from '@nestjs/swagger';
import {IsOptional, IsBoolean} from 'class-validator';
import {CreateUrlDto} from './create-url.dto';

export class UpdateUrlDto extends PartialType(CreateUrlDto) {
  @ApiProperty({
    example: true,
    description: 'Whether the URL is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

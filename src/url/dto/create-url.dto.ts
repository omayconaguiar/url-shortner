import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsOptional, Matches, Length } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    example: 'https://example.com/very/long/url/that/needs/to/be/shortened',
    description: 'The original URL to be shortened',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @ApiProperty({
    example: 'custom123',
    description: 'Custom slug for the shortened URL (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Slug must be between 3 and 50 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { 
    message: 'Slug can only contain letters, numbers, hyphens, and underscores' 
  })
  customSlug?: string;
}
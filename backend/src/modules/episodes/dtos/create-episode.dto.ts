import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';

export enum EpisodeStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

export class CreateEpisodeDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  scholarId: number;

  @IsInt()
  @IsOptional()
  seriesId?: number;

  @IsString({ each: true })
  @IsOptional()
  topics?: string[];

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsEnum(EpisodeStatus)
  @IsOptional()
  status?: EpisodeStatus = EpisodeStatus.DRAFT;
}

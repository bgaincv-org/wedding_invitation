import { Transform } from 'class-transformer'
import { ArrayMaxSize, ArrayUnique, Equals, IsArray, IsEmail, IsIn, IsInt, IsString, IsUUID, Length, Matches, Max, MaxLength, Min, ValidateIf } from 'class-validator'

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value

export class CreateRsvpDto {
  @Transform(trim) @IsString() @Length(2, 100)
  name!: string

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() @MaxLength(254)
  email!: string

  @IsIn(['yes', 'no', 'maybe'])
  attendance!: 'yes' | 'no' | 'maybe'

  @IsInt() @Min(1) @Max(6)
  guests!: number

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined) @Transform(trim) @IsString() @MaxLength(500)
  note = ''

  @Equals(true)
  consent!: true

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined) @IsString() @MaxLength(0)
  website = ''

  @IsUUID()
  requestId!: string

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined) @IsArray() @ArrayMaxSize(20) @ArrayUnique() @IsString({ each: true }) @Matches(/^[a-z0-9-]{1,40}$/, { each: true })
  eventIds: string[] = []
}

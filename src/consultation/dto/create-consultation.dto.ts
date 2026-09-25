import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

const trimValue = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;

export class CreateConsultationDto {
  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @Transform(trimValue)
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @Transform(trimValue)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[+()\d][+()\d\s-]{6,19}$/)
  @MaxLength(20)
  phone!: string;

  @IsString()
  @IsIn(["Study in the UK", "Invest in the UK", "Leisure in the UK", "Not sure yet"])
  interest!: string;
}

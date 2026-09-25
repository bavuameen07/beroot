import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import { CreateConsultationDto } from "./dto/create-consultation.dto";
import { ConsultationService } from "./consultation.service";

@Controller("api/consultations")
export class ConsultationController {
  constructor(
    @Inject(ConsultationService) private readonly consultationService: ConsultationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateConsultationDto) {
    return this.consultationService.create(body);
  }
}

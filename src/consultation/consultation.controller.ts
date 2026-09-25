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
    console.log("API request received");

    try {
      return this.consultationService.create(body);
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }
}

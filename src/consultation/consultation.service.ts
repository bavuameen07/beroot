import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CreateConsultationDto } from "./dto/create-consultation.dto";

@Injectable()
export class ConsultationService {
  create(_body: CreateConsultationDto) {
    return {
      id: randomUUID(),
      status: "received",
      receivedAt: new Date().toISOString(),
    };
  }
}

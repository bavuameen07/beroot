import { Module } from "@nestjs/common";
import { ConsultationModule } from "./consultation/consultation.module";

@Module({
  imports: [ConsultationModule],
})
export class AppModule {}

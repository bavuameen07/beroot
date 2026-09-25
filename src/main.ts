import "reflect-metadata";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const publicPath = join(process.cwd(), "public");
  if (existsSync(publicPath)) {
    app.useStaticAssets(publicPath, { index: "index.html" });
  }

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");

  return app;
}

export default bootstrap();

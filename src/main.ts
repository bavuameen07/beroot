import "reflect-metadata";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { AppModule } from "./app.module";

let appPromise: Promise<NestExpressApplication> | undefined;

function createApp(): Promise<NestExpressApplication> {
  if (!appPromise) {
    appPromise = NestFactory.create<NestExpressApplication>(AppModule).then(async (app) => {
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }));

      const publicPath = join(process.cwd(), "public");
      if (existsSync(publicPath)) {
        app.useStaticAssets(publicPath, { index: "index.html" });
      }

      await app.init();
      return app;
    });
  }

  return appPromise;
}

export const bootstrap = async (): Promise<NestExpressApplication> => {
  const app = await createApp();
  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
  return app;
};

export const handler = async (request: Request, response: Response): Promise<void> => {
  const app = await createApp();
  app.getHttpAdapter().getInstance()(request, response);
};

void bootstrap();

export default handler;

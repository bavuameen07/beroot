import "reflect-metadata";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { AppModule } from "./app.module";

const isServerless = Boolean(
  process.env.VERCEL || process.env.VERCEL_URL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);

let appPromise: Promise<NestExpressApplication> | undefined;

function createApp(): Promise<NestExpressApplication> {
  if (!appPromise) {
    console.log("[boot] creating Nest application");

    appPromise = NestFactory.create<NestExpressApplication>(AppModule)
      .then(async (app) => {
        console.log("[boot] Nest instance created");

        app.useGlobalPipes(new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: true,
        }));

        const publicPath = join(process.cwd(), "public");
        if (existsSync(publicPath)) {
          app.useStaticAssets(publicPath, { index: "index.html" });
          console.log(`[boot] serving static assets from ${publicPath}`);
        } else {
          console.log("[boot] no public dir in bundle, static assets left to the platform");
        }

        await app.init();
        console.log("[boot] app.init() complete");

        return app;
      })
      .catch((error) => {
        console.error("[boot] fatal error during app creation:", error);
        appPromise = undefined;
        throw error;
      });
  }

  return appPromise;
}

export const bootstrap = async (): Promise<NestExpressApplication> => {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3000);
  console.log(`[boot] calling app.listen() on port ${port}`);

  await app.listen(port, "0.0.0.0");
  console.log("[boot] listen resolved, server ready");

  return app;
};

export const handler = async (request: Request, response: Response): Promise<void> => {
  console.log(`[request] ${request.method} ${request.url}`);

  try {
    const app = await createApp();
    app.getHttpAdapter().getInstance()(request, response);
  } catch (error) {
    console.error("[request] error handling request:", error);

    if (!response.headersSent) {
      response.status(500).json({ message: "Internal server error" });
    }
  }
};

if (!isServerless) {
  void bootstrap().catch((error) => {
    console.error("[boot] bootstrap failed:", error);
    process.exitCode = 1;
  });
}

export default handler;

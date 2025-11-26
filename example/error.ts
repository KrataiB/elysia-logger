import { Elysia } from "elysia";
import { HttpError, logger } from "../src/index";

const app = new Elysia()
  .use(logger({}))
  .get("/", () => {
    throw HttpError.NotFound("dd");
  })
  .listen(3000);

console.log(
  `Elysia logger server running at ${app.server?.hostname}:${app.server?.port}`
);

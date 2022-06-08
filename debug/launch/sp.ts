import { ITestingSettings } from "../../test/load-settings.js";
import { Logger, LogLevel } from "@pnp/logging";
import { spSetup } from "./setup.js";
import "@pnp/sp/webs";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import { Cancelable, CancelablePromise } from "@pnp/queryable";

declare var process: { exit(code?: number): void };

export async function Example(settings: ITestingSettings) {

  const sp = spSetup(settings).using(Cancelable());

  const ww = sp.web;
  ww.on.dispose(() => {
    console.log("dispose");
  })

  const w: CancelablePromise = <any>ww();

  setTimeout(() => w.cancel(), 400);

  const y = await w;

  Logger.log({
    data: y,
    level: LogLevel.Info,
    message: "List of Web Data",
  });

  process.exit(0);
}

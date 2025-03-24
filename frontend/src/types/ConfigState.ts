import { GlobalConfigResponse } from "./GlobalConfigResponse";
import { LandingConfigResponse } from "./LandingConfigResponse";

export interface ConfigState {
    globalConfig: GlobalConfigResponse|null;
    landingConfig: LandingConfigResponse|null;
    status: "idle" | "loading" | "failed";
  }
  
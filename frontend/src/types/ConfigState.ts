import {GlobalConfig} from "./GlobalConfig.ts";
import {LandingConfig} from "./LandingConfig.ts";

export interface ConfigState {
    globalConfig: GlobalConfig | null;
    landingConfig: LandingConfig | null;
    status: "idle" | "loading" | "failed";
}
  
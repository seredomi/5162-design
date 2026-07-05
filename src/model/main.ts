import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { config } from "./config";
import { createModel3_LogCabinDetails } from "./models/model3";

export function main(): Geom3 {
  // return createModel1_Massing(config);
  // return createModel2_Layout(config);
  return createModel3_LogCabinDetails(config);
}

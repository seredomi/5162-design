import { houseConfig } from "../config";
import { basementConfig } from "../basementFloor/config";
import { deckConfig, porchConfig } from "./config";
import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { cuboid } from "@jscad/modeling/src/primitives";

export const porch = (): Geom3[] => {
  const { h: basementH } = basementConfig;
  const { w: pw, l: pl, t } = porchConfig;

  const x = pw / 2;
  const y = 0 - pl / 2; // flush against rear wall, extending outward
  const z = basementH - t / 2; // sits on top of basement

  const plate = translate([x, y, z], cuboid({ size: [pw, pl, t] }));
  return [plate];
};

import { houseConfig } from "../config";
import { basementConfig } from "../basementFloor/config";
import { deckConfig } from "./config";
import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { cuboid } from "@jscad/modeling/src/primitives";

export const deck = (): Geom3[] => {
  const { w } = houseConfig;
  const { h: basementH } = basementConfig;
  const { w: dw, l: dl, t } = deckConfig;

  // Rear of house is at y = house.l, deck extends beyond that
  const x = -w - dw / 2;
  const y = 0 - dl / 2; // flush against rear wall, extending outward
  const z = basementH - t / 2; // sits on top of basement

  const plate = translate([x, y, z], cuboid({ size: [dw, dl, t] }));
  return [plate];
};

import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { houseConfig } from "../config";
import { basementConfig } from "./config";
import { cuboid } from "@jscad/modeling/src/primitives";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { union } from "@jscad/modeling/src/operations/booleans";

export const basement = (): Geom3[] => {
  const { w, l, wallT } = houseConfig;
  const { h } = basementConfig;

  const zMid = h / 2;
  const walls: Geom3[] = [];

  // Floor slab
  walls.push(translate([-w / 2, -l / 2, wallT / 2], cuboid({ size: [w, l, wallT] })));

  // Left wall  (x = -w)
  walls.push(translate([-w + wallT / 2, -l / 2, zMid], cuboid({ size: [wallT, l, h] })));

  // Right wall  (x = 0)
  walls.push(translate([-wallT / 2, -l / 2, zMid], cuboid({ size: [wallT, l, h] })));

  // Back wall  (y = -l)
  walls.push(translate([-w / 2, -l + wallT / 2, zMid], cuboid({ size: [w, wallT, h] })));

  // Front wall  (y = 0)
  walls.push(translate([-w / 2, -wallT / 2, zMid], cuboid({ size: [w, wallT, h] })));

  return [union(walls)];
};

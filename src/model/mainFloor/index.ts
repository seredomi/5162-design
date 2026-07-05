import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { houseConfig } from "../config";
import { basementConfig } from "../basementFloor/config";
import { porchConfig } from "../porch/config";
import { roofConfig } from "../roof/config";
import { mainFloorConfig } from "./config";
import { cuboid, polygon } from "@jscad/modeling/src/primitives";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { translate, rotateZ, rotateY } from "@jscad/modeling/src/operations/transforms";
import { union } from "@jscad/modeling/src/operations/booleans";

export const mainFloor = (): Geom3[] => {
  const { w, l, wallT } = houseConfig;
  const { h: basementH } = basementConfig;
  const { l: porchL } = porchConfig;
  const { steepA } = roofConfig;
  const { h, livingRoomL, livingRoomW } = mainFloorConfig;

  const z0 = basementH;
  const zMid = z0 + h / 2;

  const lrY0 = -(porchL + livingRoomL);
  const lrY1 = -porchL;
  const gapL = l - porchL - livingRoomL;

  const walls: Geom3[] = [];

  // ── Floor slab (house footprint + living room) ─────────────────────────────

  // Main house floor
  walls.push(translate([-w / 2, -l / 2, z0 + wallT / 2], cuboid({ size: [w, l, wallT] })));

  // Living room floor
  walls.push(
    translate(
      [livingRoomW / 2, (lrY0 + lrY1) / 2, z0 + wallT / 2],
      cuboid({ size: [livingRoomW, livingRoomL, wallT] }),
    ),
  );

  // ── House walls ────────────────────────────────────────────────────────────

  // Left wall  (x = -w)
  walls.push(translate([-w + wallT / 2, -l / 2, zMid], cuboid({ size: [wallT, l, h] })));

  // Back wall  (y = -l)
  walls.push(translate([-w / 2, -l + wallT / 2, zMid], cuboid({ size: [w, wallT, h] })));

  // Front wall  (y = 0)
  walls.push(translate([-w / 2, -wallT / 2, zMid], cuboid({ size: [w, wallT, h] })));

  // Right wall, porch segment  (x = 0, y: 0 → -porchL)
  walls.push(translate([-wallT / 2, -porchL / 2, zMid], cuboid({ size: [wallT, porchL, h] })));

  // Right wall, gap segment  (x = 0, y: lrY0 → -l)
  walls.push(
    translate(
      [-wallT / 2, -(porchL + livingRoomL + gapL / 2), zMid],
      cuboid({ size: [wallT, gapL, h] }),
    ),
  );

  // ── Living room walls ──────────────────────────────────────────────────────

  // Connecting wall  (y = -porchL)
  walls.push(
    translate([livingRoomW / 2, lrY1 - wallT / 2, zMid], cuboid({ size: [livingRoomW, wallT, h] })),
  );

  // Far wall  (y = lrY0)
  walls.push(
    translate([livingRoomW / 2, lrY0 + wallT / 2, zMid], cuboid({ size: [livingRoomW, wallT, h] })),
  );

  // 5-sided porch-facing wall  (x = +livingRoomW)
  const steepRad = (steepA * Math.PI) / 180;
  const peakH = livingRoomL / 2 / Math.tan(steepRad);

  const pentProfile = polygon({
    points: [
      [0, 0],
      [livingRoomL, 0],
      [livingRoomL, h],
      [livingRoomL / 2, h + peakH],
      [0, h],
    ],
  });

  walls.push(
    translate(
      [livingRoomW + wallT, -porchL, z0],
      rotateY(-Math.PI / 2, rotateZ(-Math.PI / 2, extrudeLinear({ height: wallT }, pentProfile))),
    ),
  );

  return [union(walls)];
};

import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { houseConfig } from "../config";
import { basementConfig } from "../basementFloor/config";
import { porchConfig } from "../porch/config";
import { roofConfig } from "../roof/config";
import { mainFloorConfig } from "./config";
import { cuboid, polygon } from "@jscad/modeling/src/primitives";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { translate, rotateZ, rotateY, rotateX } from "@jscad/modeling/src/operations/transforms";
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

  const steepRad = (steepA * Math.PI) / 180;

  const walls: Geom3[] = [];

  // -- floor --

  // main house floor
  walls.push(translate([-w / 2, -l / 2, z0 + wallT / 2], cuboid({ size: [w, l, wallT] })));

  // living room floor
  walls.push(
    translate(
      [livingRoomW / 2, (lrY0 + lrY1) / 2, z0 + wallT / 2],
      cuboid({ size: [livingRoomW, livingRoomL, wallT] }),
    ),
  );

  // -- walls --

  // east wall
  walls.push(translate([-w + wallT / 2, -l / 2, zMid], cuboid({ size: [wallT, l, h] })));

  // north wall (with triangular peak)
  const mainPeakH = w / 2 / Math.tan(steepRad);

  const northWallProfile = polygon({
    points: [
      [0, 0],
      [w, 0],
      [w, h],
      [w / 2, h + mainPeakH],
      [0, h],
    ],
  });

  walls.push(
    translate(
      [0, -l, z0],
      rotateY(Math.PI, rotateX(-Math.PI / 2, extrudeLinear({ height: wallT }, northWallProfile))),
    ),
  );

  // south wall
  walls.push(translate([-w / 2, -wallT / 2, zMid], cuboid({ size: [w, wallT, h] })));

  // west wall, porch segment
  walls.push(
    translate(
      [-wallT / 2, -porchL / 2 - wallT / 2, zMid],
      cuboid({ size: [wallT, porchL + wallT, h] }),
    ),
  );

  // west wall, gap segment
  walls.push(
    translate(
      [-wallT / 2, -(porchL + livingRoomL + gapL / 2 - wallT), zMid],
      cuboid({ size: [wallT, gapL, h] }),
    ),
  );

  // -- living room walls --

  // south wall
  walls.push(
    translate([livingRoomW / 2, lrY1 - wallT / 2, zMid], cuboid({ size: [livingRoomW, wallT, h] })),
  );

  // north wall
  walls.push(
    translate([livingRoomW / 2, lrY0 + wallT / 2, zMid], cuboid({ size: [livingRoomW, wallT, h] })),
  );

  // gable wall
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
      [livingRoomW, -porchL, z0],
      rotateY(-Math.PI / 2, rotateZ(-Math.PI / 2, extrudeLinear({ height: wallT }, pentProfile))),
    ),
  );

  return [union(walls)];
};

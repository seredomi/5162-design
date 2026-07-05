import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { Config } from "../config";
import { Vec3 } from "@jscad/modeling/src/maths/vec3";
import { cuboid } from "@jscad/modeling/src/primitives";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { union } from "@jscad/modeling/src/operations/booleans";

export function createModel1_Massing(c: Config): Geom3 {
  // 1. Basement Envelope
  const basementSize: Vec3 = [c.houseWidth, c.houseLength, c.basementHeight];
  let basement: Geom3 = cuboid({ size: basementSize });
  basement = translate([0, 0, c.basementHeight / 2], basement);

  // 2. Main Floor Living Envelope
  const middleSize: Vec3 = [c.houseWidth, c.houseLength, c.middleFloorHeight];
  let middleFloor: Geom3 = cuboid({ size: middleSize });
  middleFloor = translate([0, 0, c.basementHeight + c.middleFloorHeight / 2], middleFloor);

  // 3. Simple Roof Gable Representation
  const roofHeight: number = (c.houseWidth / 2) * Math.tan((c.roofPitchAngle * Math.PI) / 180);
  const roofSize: Vec3 = [
    c.houseWidth + c.roofOverhang * 2,
    c.houseLength + c.roofOverhang * 2,
    roofHeight,
  ];
  let roofMass: Geom3 = cuboid({ size: roofSize });

  const roofZ: number = c.basementHeight + c.middleFloorHeight + roofHeight / 2;
  roofMass = translate([0, 0, roofZ], roofMass);

  return union(basement, middleFloor, roofMass);
}

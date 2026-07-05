import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { Config } from "../config";
import { Vec3 } from "@jscad/modeling/src/maths/vec3";
import { cuboid } from "@jscad/modeling/src/primitives";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { union } from "@jscad/modeling/src/operations/booleans";
import { colorize } from "@jscad/modeling/src/colors";

export function model1(c: Config): Geom3 {
  let basement: Geom3 = cuboid({ size: [c.houseWidth, c.houseLength, c.basementHeight] as Vec3 });
  basement = translate([0, 0, c.basementHeight / 2], basement);

  let middleFloor: Geom3 = cuboid({
    size: [c.houseWidth, c.houseLength, c.middleFloorHeight] as Vec3,
  });
  middleFloor = translate([0, 0, c.basementHeight + c.middleFloorHeight / 2], middleFloor);

  const roofHeight: number = (c.houseWidth / 2) * Math.tan((c.roofPitchAngle * Math.PI) / 180);
  let roofMass: Geom3 = cuboid({
    size: [
      c.houseWidth + c.roofOverhang * 2,
      c.houseLength + c.roofOverhang * 2,
      roofHeight,
    ] as Vec3,
  });
  roofMass = translate([0, 0, c.basementHeight + c.middleFloorHeight + roofHeight / 2], roofMass);

  return union(
    colorize(c.colors.basement, basement),
    colorize(c.colors.middleFloor, middleFloor),
    colorize(c.colors.roofMass, roofMass),
  );
}

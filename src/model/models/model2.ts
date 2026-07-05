import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { Config } from "../config";
import { Vec3 } from "@jscad/modeling/src/maths/vec3";
import { cuboid } from "@jscad/modeling/src/primitives";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";
import { colorize } from "@jscad/modeling/src/colors";

export function model2(c: Config): Geom3 {
  const totalShellHeight = c.basementHeight + c.middleFloorHeight;

  let houseShell: Geom3 = cuboid({ size: [c.houseWidth, c.houseLength, totalShellHeight] as Vec3 });
  houseShell = translate([0, 0, totalShellHeight / 2], houseShell);

  const cutouts: Geom3[] = [];

  const garageMould = cuboid({ size: [2.5, 0.5, 2.1] as Vec3 });
  cutouts.push(translate([-2.5, -c.houseLength / 2, 2.1 / 2], garageMould));
  cutouts.push(translate([2.5, -c.houseLength / 2, 2.1 / 2], garageMould));

  const loftVoidHeight = c.middleFloorHeight + c.loftHeight;
  let livingRoomVoid = cuboid({
    size: [c.houseWidth - 0.6, c.houseLength / 2, loftVoidHeight] as Vec3,
  });
  livingRoomVoid = translate(
    [0, -c.houseLength / 4, c.basementHeight + loftVoidHeight / 2],
    livingRoomVoid,
  );
  cutouts.push(livingRoomVoid);

  const chimneyHeight = totalShellHeight + c.loftHeight + 2.0;
  let chimney: Geom3 = cuboid({ size: [c.chimneyWidth, c.chimneyDepth, chimneyHeight] as Vec3 });
  chimney = translate(
    [c.houseWidth / 2 - c.chimneyWidth / 2, -c.houseLength / 4, chimneyHeight / 2],
    chimney,
  );

  return union(
    colorize(c.colors.houseShell, subtract(houseShell, ...cutouts)),
    colorize(c.colors.chimney, chimney),
  );
}

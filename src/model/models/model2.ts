import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { Config } from "../config";
import { Vec3 } from "@jscad/modeling/src/maths/vec3";
import { cuboid } from "@jscad/modeling/src/primitives";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";

export function createModel2_Layout(c: Config): Geom3 {
  // Combine core structural envelope
  const totalShellHeight: number = c.basementHeight + c.middleFloorHeight;
  let houseShell: Geom3 = cuboid({ size: [c.houseWidth, c.houseLength, totalShellHeight] });
  houseShell = translate([0, 0, totalShellHeight / 2], houseShell);

  // --- SUBTRACTIONS ---
  const cutouts: Geom3[] = [];

  // Two-Car Garage Portals (Front Facade)
  const garageSize: Vec3 = [2.5, 0.5, 2.1];
  const garageMould: Geom3 = cuboid({ size: garageSize });
  cutouts.push(translate([-2.5, -c.houseLength / 2, 2.1 / 2], garageMould));
  cutouts.push(translate([2.5, -c.houseLength / 2, 2.1 / 2], garageMould));

  // The Loft Overlook Void (Carves out the front half ceiling above living space)
  const loftVoidHeight: number = c.middleFloorHeight + c.loftHeight;
  let livingRoomVoid: Geom3 = cuboid({
    size: [c.houseWidth - 0.6, c.houseLength / 2, loftVoidHeight],
  });

  const voidPosition: Vec3 = [0, -c.houseLength / 4, c.basementHeight + loftVoidHeight / 2];
  livingRoomVoid = translate(voidPosition, livingRoomVoid);
  cutouts.push(livingRoomVoid);

  // --- ADDITIONS ---
  // Monolithic Stone Chimney rising past roof line
  const chimneyHeight: number = totalShellHeight + c.loftHeight + 2.0;
  let chimney: Geom3 = cuboid({ size: [c.chimneyWidth, c.chimneyDepth, chimneyHeight] });

  const chimneyPosition: Vec3 = [
    c.houseWidth / 2 - c.chimneyWidth / 2,
    -c.houseLength / 4,
    chimneyHeight / 2,
  ];
  chimney = translate(chimneyPosition, chimney);

  const parsedStructure: Geom3 = subtract(houseShell, ...cutouts);
  return union(parsedStructure, chimney);
}

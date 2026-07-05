import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { Config } from "../config";
import { cuboid, cylinder } from "@jscad/modeling/src/primitives";
import { rotateY, translate } from "@jscad/modeling/src/operations/transforms";
import { union } from "@jscad/modeling/src/operations/booleans";
import { colorize } from "@jscad/modeling/src/colors";

export function model3(c: Config): Geom3 {
  // 1. Log Stack
  const logDiameter = c.logRadius * 2;
  const backWallLogsCount = Math.floor(c.middleFloorHeight / logDiameter);
  const logs: Geom3[] = [];

  for (let i = 0; i < backWallLogsCount; i++) {
    let log: Geom3 = cylinder({
      radius: c.logRadius,
      height: c.houseWidth,
      segments: c.logSegments,
    });
    log = rotateY(Math.PI / 2, log);
    const logZ = c.basementHeight + i * logDiameter + c.logRadius;
    const logY = c.houseLength / 2;
    logs.push(translate([0, logY, logZ], log));
  }

  // 2. Stairway
  const stairs: Geom3[] = [];
  const numSteps = 14;
  const stepRise = c.middleFloorHeight / numSteps;
  const stepRun = 0.28;

  for (let i = 0; i < numSteps; i++) {
    let step = cuboid({ size: [1.0, stepRun, stepRise] });
    const stepX = -c.houseWidth / 3;
    const stepY = -c.houseLength / 4 + i * stepRun;
    const stepZ = c.basementHeight + i * stepRise + stepRise / 2;
    stairs.push(translate([stepX, stepY, stepZ], step));
  }

  // 3. Front Porch
  const porchZ = c.basementHeight;
  const porchY = -(c.houseLength / 2 + c.porchWidth / 2);
  const porchParts: Geom3[] = [
    translate([0, porchY, porchZ], cuboid({ size: [c.houseWidth, c.porchWidth, 0.2] })),
    translate(
      [0, porchY, c.basementHeight / 2],
      cuboid({ size: [c.houseWidth - 0.1, c.porchWidth - 0.1, c.basementHeight] }),
    ),
  ];

  // 4. Rear Deck
  const deckY = c.houseLength / 2 + c.deckWidth / 2;
  const deckParts: Geom3[] = [
    translate([0, deckY, c.basementHeight], cuboid({ size: [c.houseWidth, c.deckWidth, 0.2] })),
  ];

  // 5. Screen Frame
  const screenY = c.houseLength / 2 + c.deckWidth * 0.75;
  const screenParts: Geom3[] = [
    translate(
      [0, screenY, c.basementHeight + c.middleFloorHeight / 2],
      cuboid({ size: [c.houseWidth, c.deckWidth / 2, c.middleFloorHeight] }),
    ),
  ];

  return union(
    colorize(c.colors.logs, union(...logs)),
    colorize(c.colors.stairs, union(...stairs)),
    colorize(c.colors.porch, union(...porchParts)),
    colorize(c.colors.deckFrame, union(...deckParts)),
    colorize(c.colors.screenFrame, union(...screenParts)),
  );
}

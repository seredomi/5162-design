import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { Config } from "../config";
import { cuboid, cylinder } from "@jscad/modeling/src/primitives";
import { rotateY, translate } from "@jscad/modeling/src/operations/transforms";
import { union } from "@jscad/modeling/src/operations/booleans";

export function createModel3_LogCabinDetails(c: Config): Geom3 {
  const structuralElements: Geom3[] = [];

  // 1. Programmatic Log Stack Generation (Back Wall Example)
  const logDiameter: number = c.logRadius * 2;
  const backWallLogsCount: number = Math.floor(c.middleFloorHeight / logDiameter);

  for (let i = 0; i < backWallLogsCount; i++) {
    let logCylinder: Geom3 = cylinder({
      radius: c.logRadius,
      height: c.houseWidth,
      segments: c.logSegments,
    });
    // Align horizontally along the X axis
    logCylinder = rotateY(Math.PI / 2, logCylinder);

    const logZ: number = c.basementHeight + i * logDiameter + c.logRadius;
    const logY: number = c.houseLength / 2; // Placed at rear threshold

    structuralElements.push(translate([0, logY, logZ], logCylinder));
  }

  // 2. Gentle Stairway from Living Room to Loft
  const stairWidth = 1.0;
  const numSteps = 14;
  const stepRise = c.middleFloorHeight / numSteps;
  const stepRun = 0.28; // Standard run tread width

  for (let i = 0; i < numSteps; i++) {
    let step: Geom3 = cuboid({ size: [stairWidth, stepRun, stepRise] });

    // Stagger steps diagonally upward
    const stepX = -c.houseWidth / 3; // Positioned on side wall
    const stepY = -c.houseLength / 4 + i * stepRun;
    const stepZ = c.basementHeight + i * stepRise + stepRise / 2;

    structuralElements.push(translate([stepX, stepY, stepZ], step));
  }

  // 3. Covered Front Porch with Sub-Floor Cross Hatched Skirting
  const basePorchPlate: Geom3 = cuboid({ size: [c.houseWidth, c.porchWidth, 0.2] });
  const porchZ: number = c.basementHeight;
  const porchY: number = -(c.houseLength / 2 + c.porchWidth / 2);

  structuralElements.push(translate([0, porchY, porchZ], basePorchPlate));

  // Parametric Skirting Structure underneath the front porch
  let porchSkirting: Geom3 = cuboid({
    size: [c.houseWidth - 0.1, c.porchWidth - 0.1, c.basementHeight],
  });
  porchSkirting = translate([0, porchY, c.basementHeight / 2], porchSkirting);
  structuralElements.push(porchSkirting);

  // 4. Rear Deck (Divided in half for Screened-In area)
  const deckPlate: Geom3 = cuboid({ size: [c.houseWidth, c.deckWidth, 0.2] });
  const deckY: number = c.houseLength / 2 + c.deckWidth / 2;
  structuralElements.push(translate([0, deckY, c.basementHeight], deckPlate));

  // Screened-In Framing Enclosure (occupies rear half of deck footprint)
  let screenFrame: Geom3 = cuboid({ size: [c.houseWidth, c.deckWidth / 2, c.middleFloorHeight] });
  const screenY: number = c.houseLength / 2 + c.deckWidth * 0.75;
  screenFrame = translate([0, screenY, c.basementHeight + c.middleFloorHeight / 2], screenFrame);
  structuralElements.push(screenFrame);

  return union(...structuralElements);
}

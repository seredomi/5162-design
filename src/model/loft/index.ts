import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { houseConfig } from "../config";
import { basementConfig } from "../basementFloor/config";
import { mainFloorConfig } from "../mainFloor/config";
import { roofConfig } from "../roof/config";
import { loftConfig } from "./config";
import { cuboid, polygon } from "@jscad/modeling/src/primitives";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { translate, rotateX, rotateY } from "@jscad/modeling/src/operations/transforms";
import { union } from "@jscad/modeling/src/operations/booleans";

const { w, wallT } = houseConfig;
const { h: basementH } = basementConfig;
const { h: mainH } = mainFloorConfig;
const { steepA, porchA, loftA } = roofConfig;
const { l, lOffset } = loftConfig;

const z0 = basementH + mainH;
const steepRad = (steepA * Math.PI) / 180;
const loftRad = (loftA * Math.PI) / 180;

// South gable peak — same formula as main floor north wall (steepA over w/2 run)
const southPeakH = w / 2 / Math.tan(steepRad);
export const housePeakH = z0 + southPeakH;

// Height at east wall (x = -w) after loftA slope from center over w/2 run
const edgeH = southPeakH - w / 2 / Math.tan(loftRad);

export const loft = (): Geom3[] => {
  const walls: Geom3[] = [];

  // ── South gable (triangle) ──────────────────────────────────────────────────
  // Spans x: -w to 0, z: z0 to z0+southPeakH, wallT thick in Y.
  // Profile in XY (x: 0..w, y: 0..southPeakH); rotateX(-PI/2) maps Y→Z, extrudes in -Y.
  const southTriangle = polygon({
    points: [
      [0, 0],
      [w, 0],
      [w / 2, southPeakH],
    ],
  });

  walls.push(
    translate(
      [0, -wallT, z0],
      rotateY(Math.PI, rotateX(-Math.PI / 2, extrudeLinear({ height: wallT }, southTriangle))),
    ),
  );

  // ── East protrusion S/N walls ───────────────────────────────────────────────
  // Quadrilateral profile (local x: 0..w/2 maps to house x: -w..-w/2).
  // x=0   → east wall  (x = -w): height = edgeH
  // x=w/2 → center     (x = -w/2): height = porchPeakH (peak)
  const protrusionProfile = polygon({
    points: [
      [0, 0], // east  bottom
      [w / 2, 0], // center bottom
      [w / 2, southPeakH], // center top (ridge)
      [0, edgeH], // east  top (loftA slope)
    ],
  });

  // South wall of protrusion — outer face at y = -lOffset
  walls.push(
    translate(
      [-w, -lOffset, z0],
      rotateX((-3 * Math.PI) / 2, extrudeLinear({ height: wallT }, protrusionProfile)),
    ),
  );

  // rectangular east wall
  walls.push(
    translate(
      [-w + wallT / 2, -l / 2 - lOffset, basementH + mainH + edgeH / 2],
      rotateX(0, cuboid({ size: [wallT, l, edgeH] })),
    ),
  );

  // North wall of protrusion — outer face at y = -(lOffset + loftL)
  // rotateX(-PI/2) extrudes in -Y, so shift +wallT to land outer face at correct Y
  walls.push(
    translate(
      [-w, -(lOffset + l) + wallT, z0],
      rotateX((-3 * Math.PI) / 2, extrudeLinear({ height: wallT }, protrusionProfile)),
    ),
  );

  return [union(walls)];
};

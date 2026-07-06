import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { houseConfig } from "../config";
import { basementConfig } from "../basementFloor/config";
import { mainFloorConfig } from "../mainFloor/config";
import { porchConfig } from "../porch/config";
import { loftConfig } from "../loft/config";
import { roofConfig } from "./config";
import { polygon, polyhedron } from "@jscad/modeling/src/primitives";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { translate, rotateX, rotateY, mirror } from "@jscad/modeling/src/operations/transforms";
import { subtract, union } from "@jscad/modeling/src/operations/booleans";

export const roof = (): Geom3[] => {
  const { w, l } = houseConfig;
  const { h: basementH } = basementConfig;
  const { h: mainH, livingRoomL, livingRoomW } = mainFloorConfig;
  const { l: porchL } = porchConfig;
  const { l: loftL, lOffset } = loftConfig;
  const { steepA, loftA, t, overhang } = roofConfig;

  const z0 = basementH + mainH + t / 2;
  const steepRad = (steepA * Math.PI) / 180;
  const loftRad = (loftA * Math.PI) / 180;

  const pk = w / 2 / Math.tan(steepRad);
  const eZ = -overhang / Math.tan(steepRad);
  const edgeH = pk - w / 2 / Math.tan(loftRad);
  const loftEaveZ = edgeH - overhang / Math.tan(loftRad);

  const yRidge = -(porchL + livingRoomL / 2);
  const ySouthEave = -porchL + overhang;
  const yNorthEave = -(porchL + livingRoomL) - overhang;
  const xEast = livingRoomW + overhang;

  // -- helpers --

  const xzExtrude = (pts: [number, number][], ySouth: number, yNorth: number): Geom3 => {
    const ext = extrudeLinear({ height: ySouth - yNorth }, polygon({ points: pts }));
    return translate([0, ySouth, z0], rotateX((-3 * Math.PI) / 2, ext));
  };

  const yzExtrude = (pts: [number, number][], xWest: number, xE: number): Geom3 => {
    const ext = extrudeLinear({ height: xE - xWest }, polygon({ points: pts }));
    return translate([xE, 0, z0], rotateY(-Math.PI / 2, ext));
  };

  const secXZ = (x1: number, z1: number, x2: number, z2: number): [number, number][] => [
    [x1, z1],
    [x2, z2],
    [x2, z2 + t],
    [x1, z1 + t],
  ];

  // for the south gable panel y increases (eave is less negative), so we pass args
  // in eave-first order to keep the winding consistent.
  const secZY = (z1: number, y1: number, z2: number, y2: number): [number, number][] => [
    [z1, y1],
    [z2, y2],
    [z2 + t, y2],
    [z1 + t, y1],
  ];

  // tall vertical triangular prism - boolean cutting tool for valley corners
  const valleyCutter = (triPts: [number, number][]): Geom3 =>
    translate([0, 0, z0 - 5], extrudeLinear({ height: pk + t + 10 }, polygon({ points: triPts })));

  // east panels
  const eastSec = secXZ(-w / 2, pk, -w - overhang, eZ);
  const mainEastSouth = xzExtrude(eastSec, overhang, -lOffset);
  const mainEastNorth = xzExtrude(eastSec, -(lOffset + loftL), -l - overhang);

  // west panel
  const westSec = secXZ(-w / 2, pk, overhang, eZ);
  const mainWestSouth = xzExtrude(westSec, overhang, ySouthEave);
  const mainWestNorth = xzExtrude(westSec, yNorthEave, -l - overhang);

  // south valley triangular prism
  const mainWestSouthValley = polyhedron({
    points: [
      [-w / 2, ySouthEave, z0 + pk], // 0 ridge@south
      [overhang, ySouthEave, z0 + eZ], // 1 eave@south
      [-w / 2, yRidge, z0 + pk], // 2 ridge@peak
      [-w / 2, ySouthEave, z0 + pk + t], // 3
      [overhang, ySouthEave, z0 + eZ + t], // 4
      [-w / 2, yRidge, z0 + pk + t], // 5
    ],
    faces: [
      [0, 1, 2], // bottom  (−z)
      [3, 5, 4], // top     (+z)
      [0, 3, 4, 1], // south face  (+y)
      [1, 4, 5, 2], // valley face (+x,−y)
      [2, 5, 3, 0], // ridge face  (−x)
    ],
  });

  // north valley triangular prism (mirror)
  const mainWestNorthValley = polyhedron({
    points: [
      [-w / 2, yRidge, z0 + pk], // 0 ridge@peak
      [overhang, yNorthEave, z0 + eZ], // 1 eave@north
      [-w / 2, yNorthEave, z0 + pk], // 2 ridge@north
      [-w / 2, yRidge, z0 + pk + t], // 3
      [overhang, yNorthEave, z0 + eZ + t], // 4
      [-w / 2, yNorthEave, z0 + pk + t], // 5
    ],
    faces: [
      [0, 1, 2], // bottom  (−z)
      [3, 5, 4], // top     (+z)
      [1, 4, 5, 2], // north face  (−y)
      [0, 3, 4, 1], // valley face (+x,+y)
      [2, 5, 3, 0], // ridge face  (−x)
    ],
  });

  // loft roof
  const loftSec = secXZ(-w / 2, pk, -w - overhang, loftEaveZ);
  const loftRoof = xzExtrude(loftSec, -(lOffset - overhang), -(lOffset + loftL + overhang));

  // gable panels
  const gableNorthFull = yzExtrude(secZY(pk, yRidge, eZ, yNorthEave), -w / 2, xEast);
  const gableNorth = subtract(
    gableNorthFull,
    valleyCutter([
      [-w / 2, yRidge],
      [-w / 2, yNorthEave],
      [overhang, yNorthEave],
    ]),
  );

  const gableSouth = mirror({ normal: [0, 1, 0], origin: [0, yRidge, 0] }, gableNorth);

  return [
    mainWestSouth,
    mainWestSouthValley,
    mainWestNorthValley,
    mainWestNorth,
    mainEastSouth,
    mainEastNorth,
    loftRoof,
    gableNorth,
    gableSouth,
  ];
};

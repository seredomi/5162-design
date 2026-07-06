import { Geom3 } from "@jscad/modeling/src/geometries/types";
import { houseConfig } from "../config";
import { basementConfig } from "../basementFloor/config";
import { mainFloorConfig } from "../mainFloor/config";
import { porchConfig } from "../porch/config";
import { loftConfig } from "../loft/config";
import { roofConfig } from "./config";
import { polygon } from "@jscad/modeling/src/primitives";
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions";
import { translate, rotateX, rotateY } from "@jscad/modeling/src/operations/transforms";

export const roof = (): Geom3[] => {
  const { w, l } = houseConfig;
  const { h: basementH } = basementConfig;
  const { h: mainH, livingRoomL, livingRoomW } = mainFloorConfig;
  const { l: porchL } = porchConfig;
  const { l: loftL, lOffset } = loftConfig;
  const { steepA, loftA, t, overhang } = roofConfig;

  const z0 = basementH + mainH;
  const steepRad = (steepA * Math.PI) / 180;
  const loftRad = (loftA * Math.PI) / 180;

  const mainPeakH = w / 2 / Math.tan(steepRad);
  const edgeH = mainPeakH - w / 2 / Math.tan(loftRad);

  // The eave z (relative to z0): slope continues past wall at steepA,
  // dropping overhang/tan(steepRad) below the wall top.
  const mainEaveZ = -overhang / Math.tan(steepRad);
  const loftEaveZ = edgeH - overhang / Math.tan(loftRad);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  // XZ cross-section (pts: [x, z_local]) extruded along Y.
  // rotateX(PI/2): polygon-Y → world-Z, extrusion → world-(-Y).
  // Translate to ySouth; panel spans y: yNorth … ySouth.
  const xzExtrude = (pts: [number, number][], ySouth: number, yNorth: number): Geom3 => {
    const yLen = ySouth - yNorth;
    const ext = extrudeLinear({ height: yLen }, polygon({ points: pts }));
    return translate([0, ySouth, z0], rotateX((-3 * Math.PI) / 2, ext));
  };

  // YZ cross-section (pts: [z_local, y_abs]) extruded along X.
  // rotateY(-PI/2): polygon-X(z)→world-Z, polygon-Y(y)→world-Y, extrusion→world-(-X).
  // Translate to xEast; panel spans x: xWest … xEast.
  const yzExtrude = (pts: [number, number][], xWest: number, xEast: number): Geom3 => {
    const xLen = xEast - xWest;
    const ext = extrudeLinear({ height: xLen }, polygon({ points: pts }));
    return translate([xEast, 0, z0], rotateY(-Math.PI / 2, ext));
  };

  // Thin panel section with vertical thickness t (good enough for visualization).
  const secXZ = (x1: number, z1: number, x2: number, z2: number): [number, number][] => [
    [x1, z1],
    [x2, z2],
    [x2, z2 + t],
    [x1, z1 + t],
  ];

  // Same in [z_local, y_abs] space; thickness added to z.
  const secZY = (z1: number, y1: number, z2: number, y2: number): [number, number][] => [
    [z1, y1],
    [z2, y2],
    [z2 + t, y2],
    [z1 + t, y1],
  ];

  // ── Main Roof ────────────────────────────────────────────────────────────────

  // West panel: eave at x=+overhang (z=mainEaveZ) → ridge at x=-w/2 (z=mainPeakH)
  const westSec = secXZ(overhang, mainEaveZ, -w / 2, mainPeakH);
  const mainWest = xzExtrude(westSec, overhang, -l - overhang);

  // East panel: ridge at x=-w/2 → eave at x=-w-overhang (z=mainEaveZ)
  // Split north/south around the loft walls.
  const eastSec = secXZ(-w / 2, mainPeakH, -w - overhang, mainEaveZ);
  const mainEastSouth = xzExtrude(eastSec, overhang, -lOffset);
  const mainEastNorth = xzExtrude(eastSec, -(lOffset + loftL), -l - overhang);

  // ── Loft Roof ────────────────────────────────────────────────────────────────
  // Ridge at x=-w/2 (mainPeakH) → eave at x=-w-overhang (loftEaveZ, using loftA)
  const loftSec = secXZ(-w / 2, mainPeakH, -w - overhang, loftEaveZ);
  const loftRoof = xzExtrude(loftSec, -(lOffset - overhang), -(lOffset + loftL + overhang));

  // ── Gable Roof (living room) ─────────────────────────────────────────────────
  // Ridge runs along X at y_center; panels slope north/south with same steepA.
  const gablePeakH = livingRoomL / 2 / Math.tan(steepRad);
  const gableEaveZ = -overhang / Math.tan(steepRad); // same angle as main roof
  const yRidge = -(porchL + livingRoomL / 2);
  const ySouthEave = -porchL + overhang;
  const yNorthEave = -(porchL + livingRoomL) - overhang;

  // South panel: ridge (z=gablePeakH, y=yRidge) → south eave (z=gableEaveZ, y=ySouthEave)
  const gableSouthSec = secZY(gablePeakH, yRidge, gableEaveZ, ySouthEave);
  const gableSouth = yzExtrude(gableSouthSec, -overhang, livingRoomW + overhang);

  // North panel: ridge → north eave (points reversed so extrusion faces correctly)
  const gableNorthSec = secZY(gableEaveZ, yNorthEave, gablePeakH, yRidge);
  const gableNorth = yzExtrude(gableNorthSec, -overhang, livingRoomW + overhang);

  // Return all panels individually — avoid union() on shared-ridge panels,
  // which causes JSCAD to silently drop geometry.
  return [mainWest, mainEastSouth, mainEastNorth, loftRoof, gableSouth, gableNorth];
};

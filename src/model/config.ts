import { RGBA } from "@jscad/modeling/src/colors/types";

export type Colors = {
  // model1
  basement: RGBA;
  middleFloor: RGBA;
  roofMass: RGBA;
  // model2
  houseShell: RGBA;
  chimney: RGBA;
  // model3
  logs: RGBA;
  stairs: RGBA;
  porch: RGBA;
  deckFrame: RGBA;
  screenFrame: RGBA;
};

export type Config = {
  houseWidth: number;
  houseLength: number;
  basementHeight: number;
  middleFloorHeight: number;
  loftHeight: number;
  logRadius: number;
  logSegments: number;
  roofPitchAngle: number;
  roofOverhang: number;
  chimneyWidth: number;
  chimneyDepth: number;
  porchWidth: number;
  deckWidth: number;
  colors: Colors;
};

export const config: Config = {
  houseWidth: 12.0,
  houseLength: 16.0,
  basementHeight: 2.6,
  middleFloorHeight: 2.8,
  loftHeight: 2.4,
  logRadius: 0.15,
  logSegments: 16,
  roofPitchAngle: 40,
  roofOverhang: 0.6,
  chimneyWidth: 1.2,
  chimneyDepth: 1.2,
  porchWidth: 2.5,
  deckWidth: 3.0,
  colors: {
    basement: [0.45, 0.42, 0.4, 1],
    middleFloor: [0.72, 0.58, 0.42, 1],
    roofMass: [0.3, 0.25, 0.22, 1],
    houseShell: [0.72, 0.58, 0.42, 1],
    chimney: [0.45, 0.42, 0.4, 1],
    logs: [0.6, 0.38, 0.18, 1],
    stairs: [0.5, 0.32, 0.14, 1],
    porch: [0.55, 0.36, 0.16, 1],
    deckFrame: [0.48, 0.3, 0.12, 1],
    screenFrame: [0.7, 0.7, 0.68, 1],
  },
};

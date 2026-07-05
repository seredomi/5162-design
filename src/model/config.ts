export type Config = {
  // global envelope
  houseWidth: number;
  houseLength: number;

  // floor elevations
  basementHeight: number;
  middleFloorHeight: number;
  loftHeight: number;

  // log cabin constraints
  logRadius: number;
  logSegments: number;

  // roof mechanics
  roofPitchAngle: number; // in degrees
  roofOverhang: number;

  // structural features
  chimneyWidth: number;
  chimneyDepth: number;
  porchWidth: number;
  deckWidth: number;
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
};

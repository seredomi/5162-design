export type RoofConfig = {
  steepA: number;
  deckA: number;
  porchA: number;
  loftA: number;
  t: number;
  slatW: number;
  overhang: number;
};

export const roofConfig: RoofConfig = {
  steepA: 40,
  deckA: 80,
  porchA: 60,
  loftA: 70,
  t: 0.5,
  slatW: 0.5,
  overhang: 1,
};

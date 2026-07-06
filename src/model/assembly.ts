import { basement } from "./basementFloor";
import { deck } from "./deck";
import { porch } from "./porch";
import { mainFloor } from "./mainFloor";
import { colorize } from "@jscad/modeling/src/colors";
import { sphere } from "@jscad/modeling/src/primitives";
import { translate } from "@jscad/modeling/src/operations/transforms";
import { loft } from "./loft";
import { roof } from "./roof";
import { Color } from "@jscad/modeling/src/geometries/types";

const lekha = translate([-5, -25, 15], sphere({ radius: 5 }));

const brown: Color = [1, 0.5, 0, 1];
const green: Color = [0.5, 1, 0, 1];
const light: Color = [1, 1, 1, 0.4];

export const assembly = () => {
  return [
    // colorize([0, 100, 100, 0.6], lekha),
    colorize(light, [...basement()]),
    colorize(light, [...deck(), ...porch()]),
    colorize(light, [...basement(), ...mainFloor()]),
    colorize(light, [...loft()]),
    colorize(light, [...roof()]),
  ];
};

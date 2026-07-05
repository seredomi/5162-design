import { basement } from "./basementFloor";
import { deck } from "./deck";
import { porch } from "./porch";
import { mainFloor } from "./mainFloor";
import { colorize } from "@jscad/modeling/src/colors";
import { sphere } from "@jscad/modeling/src/primitives";
import { translate } from "@jscad/modeling/src/operations/transforms";

const lekha = translate([-5, -25, 15], sphere({ radius: 5 }));

export const assembly = () => {
  return [
    colorize([0, 100, 100, 0.6], lekha),
    colorize([1, 1, 255, 0.5], [...basement(), ...deck(), ...porch(), ...mainFloor()]),
  ];
};

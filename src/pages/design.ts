import { Parameter } from "../components/Parameters/parameters";
import { assembly } from "../model/assembly";

export const getParameterDefinitions = (): Parameter[] => [];

export const main = (_params?: Parameter[]) => {
  return assembly();
};

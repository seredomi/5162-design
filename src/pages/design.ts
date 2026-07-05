import { colorize } from "@jscad/modeling/src/colors";
import { Parameter } from "../components/Parameters/parameters";
import { config } from "../model/config";
import { assemble, assembly } from "../model/models/assembly";

export const getParameterDefinitions = (): Parameter[] => [];

export const main = (_params?: Record<string, unknown>) => {
  return assembly();
};

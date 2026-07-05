import { Parameter } from "../components/Parameters/parameters";
import { config } from "../model/config";
import { model2 } from "../model/models/model2";

export const getParameterDefinitions = (): Parameter[] => [];

export const main = (_params?: Record<string, unknown>) => {
  return model2(config);
};

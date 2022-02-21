import servers from "./servers";
import kernels from "./kernels";
import notebooks from "./notebooks";
import config from "./config";
import cells from "./cells";

export const actions = {
  config: config.actions,
  servers: servers.actions,
  kernels: kernels.actions,
  notebooks: notebooks.actions,
  cells: cells.actions,
};
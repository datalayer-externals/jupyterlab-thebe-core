import { nanoid } from "nanoid";
import CellRenderer from "./renderer";
import { getContext } from "./context";
import ThebeKernel from "./kernel";
import { ThebeManager } from "./manager";
import { actions } from "./store";
import notebooks from "./store/notebooks";
import { JsonObject, MathjaxOptions, Options, ThebeContext } from "./types";

export interface CodeBlock {
  id: string;
  source: string;
  [x: string]: any;
}

class Notebook {
  id: string;
  ctx: ThebeContext;
  cells?: CellRenderer[];

  static fromCodeBlocks(blocks: CodeBlock[], mathjax: MathjaxOptions = {}) {
    const ctx = getContext();
    const id = nanoid();
    ctx.store.dispatch(
      notebooks.actions.setup({
        id,
        cells: blocks.map(({ id }) => id),
      })
    );

    const notebook = new Notebook(id);
    ctx.notebooks[id] = notebook;
    notebook.cells = blocks.map((c) => {
      ctx.store.dispatch(actions.cells.add({ id: c.id, source: c.source }));
      const cell = new CellRenderer(ctx, c.id, id);
      console.debug(`thebe:notebook:fromCodeBlocks Initializing cell ${c.id}`);
      cell.init(mathjax);
      return cell;
    });

    return notebook;
  }

  constructor(id: string) {
    this.ctx = getContext();
    this.id = id;
  }

  numCells() {
    return this.cells?.length ?? 0;
  }

  getCell(idx: number) {
    if (!this.cells) throw Error("Dag not initialized");
    if (idx >= this.cells.length)
      throw Error(
        `Notebook.cells index out of range: ${idx}:${this.cells.length}`
      );
    return this.cells[idx];
  }

  getCellById(id: string) {
    const cell = this.cells?.find((cell: CellRenderer) => cell.id === id);
    return cell;
  }

  lastCell() {
    if (!this.cells) throw Error("Notebook not initialized");
    return this.cells[this.cells.length - 1];
  }

  hookup(kernel: ThebeKernel) {
    if (!kernel.connection) return;
    // TODO seems the manage is all about the context! can we
    // skip using the manager, user a single rendermin registry
    // and an alternate execute() method in the cell?
    // https://github.com/jupyterlab/jupyterlab/blob/master/packages/cells/src/widget.ts#L1119
    const manager = new ThebeManager(kernel.connection);
    this.cells?.map((cell) => cell.hookup(manager));
  }

  async executeUpTo(
    kernelId: string,
    cellId: string,
    preprocessor?: (s: string) => string
  ) {
    if (!this.cells) return null;
    const idx = this.cells.findIndex((c) => c.id === cellId);
    if (idx === -1) return null;
    const cellsToExecute = this.cells.slice(0, idx + 1);
    cellsToExecute.map((cell) => cell.renderBusy(true));
    const state = this.ctx.store.getState();
    let result = null;
    for (let cell of cellsToExecute) {
      console.debug(`Executing cell ${cell.id}`);
      const { source } = state.thebe.cells[cell.id];
      result = await cell?.execute(
        kernelId,
        preprocessor ? preprocessor(source) : source
      );
      if (!result) {
        console.error(`Error executing cell ${cell.id}`);
        return null;
      }
    }
    return result;
  }

  async executeOnly(
    kernelId: string,
    cellId: string,
    preprocessor?: (s: string) => string
  ) {
    if (!this.cells) return null;
    const cell = this.cells.find((c) => c.id === cellId);
    if (!cell) return null;
    const state = this.ctx.store.getState();
    const { source } = state.thebe.cells[cellId];
    const result = await cell?.execute(
      kernelId,
      preprocessor ? preprocessor(source) : source
    );
    if (!result) {
      console.error(`Error executing cell ${cell.id}`);
      return null;
    }
    return result;
  }

  async executeAll(
    kernelId: string,
    preprocessor?: (s: string) => string
  ): Promise<{
    height: number;
    width: number;
  } | null> {
    if (!this.cells) return null;
    this.cells.map((cell) => cell.renderBusy(true));
    const state = this.ctx.store.getState();
    let result = null;
    for (let cell of this.cells) {
      const { source } = state.thebe.cells[cell.id];
      result = await cell.execute(
        kernelId,
        preprocessor ? preprocessor(source) : source
      );
      if (!result) {
        console.error(`Error executing cell ${cell.id}`);
        return null;
      }
    }
    return result;
  }
}

export default Notebook;
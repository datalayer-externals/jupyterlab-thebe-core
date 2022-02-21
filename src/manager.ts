import { requireLoader } from "@jupyter-widgets/html-manager";
import { DocumentRegistry } from "@jupyterlab/docregistry";
import { INotebookModel } from "@jupyterlab/notebook";

import * as pWidget from "@lumino/widgets";

import {
  RenderMimeRegistry,
  standardRendererFactories,
} from "@jupyterlab/rendermime";

import {
  WidgetManager as JupyterLabManager,
  WidgetRenderer,
  output,
} from "@jupyter-widgets/jupyterlab-manager";

import * as base from "@jupyter-widgets/base";

import * as controls from "@jupyter-widgets/controls";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { ISessionConnection } from "@jupyterlab/services/lib/session/session";
import { Widget } from "@lumino/widgets";

const WIDGET_MIMETYPE = "application/vnd.jupyter.widget-view+json";

export class ThebeManager extends JupyterLabManager {
  loader: typeof requireLoader;

  constructor(kernel: IKernelConnection) {
    const context = createContext(kernel);
    // TODO why are we doing renderMime setup here and in cell.hookup?
    // if we create the mamage earlier can we pass this to the cells and
    // use the single rendermime in here??
    const renderMime = new RenderMimeRegistry({
      initialFactories: standardRendererFactories,
    });
    const settings = {
      saveState: false,
    };
    super(context, renderMime, settings);

    renderMime.addFactory(
      {
        safe: false,
        mimeTypes: [WIDGET_MIMETYPE],
        createRenderer: (options) => new WidgetRenderer(options, this),
      },
      1
    );

    this._registerWidgets();
    this.loader = requireLoader;
  }

  _registerWidgets() {
    this.register({
      name: "@jupyter-widgets/base",
      version: base.JUPYTER_WIDGETS_VERSION,
      exports: base as unknown as base.ExportData, // TODO improve typing
    });
    this.register({
      name: "@jupyter-widgets/controls",
      version: controls.JUPYTER_CONTROLS_VERSION,
      exports: controls as unknown as base.ExportData, // TODO improve typing
    });
    this.register({
      name: "@jupyter-widgets/output",
      version: output.OUTPUT_WIDGET_VERSION,
      exports: output as unknown as base.ExportData, // TODO improve typing
    });
  }

  async loadClass(
    className: string,
    moduleName: string,
    moduleVersion: string
  ): Promise<typeof base.WidgetModel | typeof base.WidgetView> {
    if (
      moduleName === "@jupyter-widgets/base" ||
      moduleName === "@jupyter-widgets/controls" ||
      moduleName === "@jupyter-widgets/output"
    ) {
      return super.loadClass(className, moduleName, moduleVersion);
    } else {
      // TODO: code duplicate from HTMLWidgetManager, consider a refactor
      console.debug(`ThebeManager:loadClass ${moduleName}@${moduleVersion}`);
      return this.loader(moduleName, moduleVersion).then((module) => {
        if (module[className]) {
          return module[className];
        } else {
          return Promise.reject(
            "Class " +
              className +
              " not found in module " +
              moduleName +
              "@" +
              moduleVersion
          );
        }
      });
    }
  }

  async display_view(
    msg: any,
    view: Backbone.View<Backbone.Model>,
    options: any
  ): Promise<Widget> {
    const el = options.el;
    if (el) {
      pWidget.Widget.attach((view as any).pWidget, el);
    }
    return (view as any).pWidget;
  }
}

function createContext(
  kernel: IKernelConnection
): DocumentRegistry.IContext<INotebookModel> {
  return {
    sessionContext: {
      session: {
        kernel,
        kernelChanged: {
          connect: () => {},
          disconnect: () => {},
        } as any, // TODO improve typing
      } as ISessionConnection,
      kernelChanged: {
        connect: () => {},
      } as any,
      statusChanged: {
        connect: () => {},
      } as any,
      connectionStatusChanged: {
        connect: () => {},
      } as any,
    },
    saveState: {
      connect: () => {},
    } as any,
    model: {
      metadata: {
        get: () => {},
      },
    } as any,
  } as DocumentRegistry.IContext<INotebookModel>;
}
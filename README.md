# thebe-core

`thebe-core` is a headless connector library allowing a developer to connect to and execute code on a Jupyter based compute resource from any Javascript environemnt.

Written in Typescript and indended for use in other packages and applicaitons, `thebe-core` has minimal state and introduces no restrictions on UI frameworks that might be used. [thebe](https://github.com/executablebooks/thebe) will use `thebe-core` to provide a `jquery` based connector, that uses prosemirror to enable editing and execution of code cells on any webpage.

`thebe-core` supports connecting to a BinderHub, JupyterHub, any Jupyter instance or JupyterLite with the pyiolite kernel.

![thebe-core with ipywidgets](thebe-lite-widgets.gif)

## Status

`thebe-core` should be considered as beta software and may be subject to further significant changes, however it is ready for test integration and usage. We welcome feedback.

# Getting Started

Install the library from npm:

```
  npm install thebe-core
```

## Typescript

Follow the Getting started from Typescript section of the docs

## Javascript

To use `thebe-core` directly from a web page or Javascript application, load the minified library via a script tag:

```
 <script src="thebe-core.min.js" type="text/javascript"></script>
```

# Contributing

To learn how to build `thebe-core` itself and contribute to the development of the library see [Contributing](contributing.md)

## Usage

For more information on how to invoke thebe and connect to a kernel see [demo/index.html](./demo/index.html) and [demo/demo.js](./demo/demo.js).

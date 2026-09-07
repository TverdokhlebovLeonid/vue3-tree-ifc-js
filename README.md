# vue3-tree-ifc-js

A web application for viewing and exploring **IFC models** (Industry Foundation Classes) — the standard data exchange format in BIM (Building Information Modeling).

The app lets you load IFC files, visualize a building’s 3D model, browse its spatial structure, and use navigation and sectioning tools.

## Features

- **IFC 3D viewer** — model rendering powered by [web-ifc-viewer](https://github.com/ThatOpen/web-ifc-viewer) and [Three.js](https://threejs.org/)
- **File upload** — pick a local `.ifc` file; a demo model (`public/ifc/demo.ifc`) loads on startup
- **Requisites tree** — spatial structure of the model (storeys, spaces, etc.) with support for:
  - highlighting elements in the 3D scene
  - hiding and showing element groups
- **Viewer tools:**
  - **Plane** — create a section plane with a double-click; remove it with a right-click
  - **Coordinates** — read model point coordinates on click
  - **Navigation cube** — quick camera orientation changes
  - **Full screen** — view the model in fullscreen mode
- **Grid and axes** — scene references for easier navigation

## Tech stack

| Category | Technologies |
|----------|--------------|
| UI | [Vue 3](https://vuejs.org/), [Element Plus](https://element-plus.org/) |
| Build | [Vite](https://vitejs.dev/), TypeScript, Sass |
| 3D / IFC | [Three.js](https://threejs.org/), [web-ifc-viewer](https://github.com/ThatOpen/web-ifc-viewer) |
| Tests | [Vitest](https://vitest.dev/), [Vue Test Utils](https://test-utils.vuejs.org/) |

## Quick start

```sh
npm install
npm run dev
```

After startup, open the URL printed by Vite (usually `http://localhost:5173`).

To load your own model, use the file picker in the viewer UI — only `.ifc` files are supported.

## Project structure

```
src/
├── components/IfcViewing/   # IFC viewer, tools, navigation cube, requisites
├── views/                   # application screens
├── layouts/                 # page layouts
└── constants/               # viewer tool constants
public/
└── ifc/                     # demo IFC model
```

## Scripts

### Development with hot reload

```sh
npm run dev
```

### Production build

```sh
npm run build
```

### Preview production build

```sh
npm run preview
```

### Type checking and linting

```sh
npm run type-check
npm run lint
npm run format
```

### Tests

```sh
npm run test
```

Run a single test suite (for example, `IfcViewingRequisites`):

```sh
npm run test-single
```

## Recommended IDE

[VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).

TypeScript uses `vue-tsc` instead of `tsc` for proper type support in `.vue` files.

## Configuration

See the [Vite Configuration Reference](https://vitejs.dev/config/).

## Live demo

A simplified IFC viewer is available at [tverleon.com/cases](https://tverleon.com/cases). You can try it in the browser without running this project locally.

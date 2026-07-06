<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  prepareRender,
  drawCommands,
  cameras,
  entitiesFromSolids,
} from "@jscad/regl-renderer";
import { extrusions, transforms } from "@jscad/modeling";
import axios from "axios";

import { main, getParameterDefinitions } from "./design";

import MainMenu from "../components/MainMenu/index.vue";
import { UiState } from "../components/MainMenu/ui-state";

const { rotateX, rotateY, rotateZ } = transforms;
const { project } = extrusions;

const appendExtension = (fileName: string, extension: string) => {
  if (fileName.toLowerCase().endsWith(extension)) return fileName;
  return `${fileName}.${extension}`;
};

let updateView = true;
const pointerLocked = ref(false);

const uiState = ref<UiState>({
  gridOn: true,
  axisOn: true,
});

uiState.value = localStorage.getItem("uiState")
  ? JSON.parse(localStorage.getItem("uiState") || JSON.stringify(uiState.value))
  : uiState.value;

const exportName = ref("design");
const exporting = ref(false);
const exportError = ref("");
const exportModalVisible = ref(false);

const showExportModal = () => {
  exportModalVisible.value = true;
  setTimeout(() => {
    (document.getElementById("exportName") as HTMLInputElement)?.focus();
  }, 100);
};

const hideExportModal = () => {
  exportModalVisible.value = false;
  exportError.value = "";
};

const params = ref({});
params.value = localStorage.getItem("params")
  ? JSON.parse(localStorage.getItem("params") || JSON.stringify(params.value))
  : params.value;

const saveUiState = () => {
  localStorage.setItem("uiState", JSON.stringify(uiState.value));
  localStorage.setItem("params", JSON.stringify(params.value));
};

const toggleGrid = () => {
  uiState.value.gridOn = !uiState.value.gridOn;
  updateView = true;
  saveUiState();
};

const toggleAxis = () => {
  uiState.value.axisOn = !uiState.value.axisOn;
  updateView = true;
  saveUiState();
};

const toggleProjection = () => {
  uiState.value.projectEntities = !uiState.value.projectEntities;
  entities = entitiesFromSolids({}, ...[postProcess(main(params.value))].flat());
  updateView = true;
  saveUiState();
};

const toggleRotateX = () => {
  uiState.value.rotateEntitiesX = !uiState.value.rotateEntitiesX;
  entities = entitiesFromSolids({}, ...[postProcess(main(params.value))].flat());
  updateView = true;
  saveUiState();
};

const toggleRotateY = () => {
  uiState.value.rotateEntitiesY = !uiState.value.rotateEntitiesY;
  entities = entitiesFromSolids({}, ...[postProcess(main(params.value))].flat());
  updateView = true;
  saveUiState();
};

const toggleRotateZ = () => {
  uiState.value.rotateEntitiesZ = !uiState.value.rotateEntitiesZ;
  entities = entitiesFromSolids({}, ...[postProcess(main(params.value))].flat());
  updateView = true;
  saveUiState();
};

const resetViewport = () => {
  localStorage.removeItem("params");
  localStorage.removeItem("uiState");
  localStorage.removeItem("fpsState");
  window.location.reload();
};

const postProcess = (entities: any) => {
  let finalEntities = entities;
  if (uiState.value.rotateEntitiesX) finalEntities = rotateX(Math.PI / 2, finalEntities);
  if (uiState.value.rotateEntitiesY) finalEntities = rotateY(Math.PI / 2, finalEntities);
  if (uiState.value.rotateEntitiesZ) finalEntities = rotateZ(Math.PI / 2, finalEntities);
  if (uiState.value.projectEntities) finalEntities = project({}, finalEntities);
  return finalEntities;
};

let entities = entitiesFromSolids({}, ...[postProcess(main(params.value))].flat());

const export3mf = () => {
  if (!exporting.value) {
    exportError.value = "";
    exporting.value = true;
    axios
      .post("/api/export/3mf/", { ...params.value, ...uiState.value, exportName: appendExtension(exportName.value, "3mf") })
      .catch((e) => { exportError.value = e.response?.data?.message || e.message || e; })
      .finally(() => (exporting.value = false));
  }
};

const exportX3d = () => {
  if (!exporting.value) {
    exportError.value = "";
    exporting.value = true;
    axios
      .post("/api/export/x3d/", { ...params.value, ...uiState.value, exportName: appendExtension(exportName.value, "x3d") })
      .catch((e) => { exportError.value = e.response?.data?.message || e.message || e; })
      .finally(() => (exporting.value = false));
  }
};

const exportSvg = () => {
  if (!exporting.value) {
    exportError.value = "";
    exporting.value = true;
    axios
      .post("/api/export/svg/", { ...params.value, ...uiState.value, exportName: appendExtension(exportName.value, "svg") })
      .catch((e) => { exportError.value = e.response?.data?.message || e.message || e; })
      .finally(() => (exporting.value = false));
  }
};

onMounted(() => {
  const perspectiveCamera = cameras.perspective;
  const containerElement = document.getElementById("design") as HTMLDivElement;

  let width = containerElement.clientWidth;
  let height = containerElement.clientHeight;

  // ── FPS camera state ──────────────────────────────────────────────────────
  // Default: stand back-right of the model, looking toward its center.
  // House spans x: -26..0, y: -90..0, z: 0..20ish
  let camPos: [number, number, number] = [30, 20, 40];
  let yaw   = Math.PI * 1.25;  // ~225°, looking toward -X/-Y
  let pitch = -0.35;            // slight downward tilt

  const saved = localStorage.getItem("fpsState");
  if (saved) {
    const s = JSON.parse(saved);
    if (s.position) camPos = s.position;
    if (s.yaw   != null) yaw   = s.yaw;
    if (s.pitch != null) pitch = s.pitch;
  }

  const clampPitch = (p: number) =>
    Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, p));

  /** Unit forward vector from current yaw / pitch */
  const forward = (): [number, number, number] => [
    Math.sin(yaw)  * Math.cos(pitch),
    Math.cos(yaw)  * Math.cos(pitch),
    Math.sin(pitch),
  ];

  /** Unit right vector (flat — no pitch) */
  const right = (): [number, number, number] => [
    Math.cos(yaw),
   -Math.sin(yaw),
    0,
  ];

  const camera: any = Object.assign({}, perspectiveCamera.defaults);

  const syncCamera = () => {
    const f = forward();
    camera.position = [...camPos];
    camera.target   = [camPos[0] + f[0], camPos[1] + f[1], camPos[2] + f[2]];
  };

  syncCamera();
  perspectiveCamera.setProjection(camera, camera, { width, height });
  perspectiveCamera.update(camera, camera);

  const saveFpsState = () =>
    localStorage.setItem("fpsState", JSON.stringify({ position: camPos, yaw, pitch }));

  // ── Renderer setup ────────────────────────────────────────────────────────
  const renderer = prepareRender({ glOptions: { container: containerElement } });

  const gridOptions = () => ({
    visuals: { drawCmd: "drawGrid", show: uiState.value.gridOn },
    size: [500, 500],
    ticks: [100, 10],
    color: [0, 0, 255, 1],
    subColor: [0, 0, 255, 0.5],
  });

  const axisOptions = () => ({
    visuals: { drawCmd: "drawAxis", show: uiState.value.axisOn },
    size: 150,
  });

  // assemble the options for rendering
  let cachedRenderEntities: any[] = [];
  const rebuildRenderEntities = () => {
    cachedRenderEntities = [
      ...entities,
      axisOptions(),
      gridOptions()];
  };
  rebuildRenderEntities();
  const renderOptions = () => ({
    camera,
    drawCommands: {
      drawAxis:  drawCommands.drawAxis,
      drawGrid:  drawCommands.drawGrid,
      drawLines: drawCommands.drawLines,
      drawMesh:  drawCommands.drawMesh,
    },
    rendering: {
      background:           [0.96, 0.96, 0.97, 1],
      lightDirection:       [0.0, 0.0, 1.0],
      lightPosition:        [100.0, 100.0, 100.0],
      ambientLightAmount:   0.5,
      diffuseLightAmount:   0.0,
      specularLightAmount:  0.0,
      materialShininess:    1.0,
    },
    entities: cachedRenderEntities,
  });

  // pointer stuff
  containerElement.addEventListener("click", () => {
    if (!exportModalVisible.value) {
      containerElement.requestPointerLock();
    }
  });

  document.addEventListener("pointerlockchange", () => {
    pointerLocked.value = document.pointerLockElement === containerElement;
  });

  const lookSensitivity = 0.002;

  document.addEventListener("mousemove", (ev) => {
    if (document.pointerLockElement !== containerElement) return;
    yaw    += ev.movementX * lookSensitivity;
    pitch   = clampPitch(pitch - ev.movementY * lookSensitivity);
    syncCamera();
    updateView = true;
  });

  // scroll - dollly
  containerElement.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const f = forward();
    const speed = ev.deltaY * 0.05;
    camPos = [camPos[0] + f[0] * speed, camPos[1] + f[1] * speed, camPos[2] + f[2] * speed];
    syncCamera();
    updateView = true;
  }, { passive: false });

  // kb
  const keys: Record<string, boolean> = {};
  window.addEventListener("keydown", (e) => { keys[e.code] = true; });
  window.addEventListener("keyup",   (e) => { keys[e.code] = false; });

  const MOVE_SPEED = 0.4;

  const processKeys = () => {
    if (!pointerLocked.value) return;

    const f = forward();
    const r = right();
    let moved = false;

    const move = (dx: number, dy: number, dz: number) => {
      camPos = [camPos[0] + dx, camPos[1] + dy, camPos[2] + dz];
      moved = true;
    };

    // forward / back - ignore vertical component
    if (keys["KeyW"]) move(f[0] * MOVE_SPEED, f[1] * MOVE_SPEED, f[2] * MOVE_SPEED);
    if (keys["KeyS"]) move(-f[0] * MOVE_SPEED, -f[1] * MOVE_SPEED, -f[2] * MOVE_SPEED);

    // strafe
    if (keys["KeyA"]) move(-r[0] * MOVE_SPEED, -r[1] * MOVE_SPEED, 0);
    if (keys["KeyD"]) move( r[0] * MOVE_SPEED,  r[1] * MOVE_SPEED, 0);

    // vertical (Q = up, E = down; space / shift also work)
    if (keys["KeyQ"] || keys["Space"])      move(0, 0,  MOVE_SPEED);
    if (keys["KeyE"] || keys["ShiftLeft"])  move(0, 0, -MOVE_SPEED);

    if (moved) {
      syncCamera();
      updateView = true;
    }
  };

  // animation loop
  const updateAndRender = (_: number) => {
    processKeys();

    if (updateView) {
      perspectiveCamera.update(camera);
      renderer(renderOptions());
      saveFpsState();
      updateView = false;
    }

    window.requestAnimationFrame(updateAndRender);
  };

  window.requestAnimationFrame(updateAndRender);

  // resize
  window.addEventListener("resize", () => {
    width  = containerElement.clientWidth;
    height = containerElement.clientHeight;
    perspectiveCamera.setProjection(camera, camera, { width, height });
    perspectiveCamera.update(camera, camera);
    entities = entitiesFromSolids({}, ...[postProcess(main(params.value))].flat());
    updateView = true;
  });
});

const onParamChange = (paramValues: any) => {
  params.value = paramValues;
  entities = entitiesFromSolids({}, ...[postProcess(main(params.value))].flat());
  updateView = true;
  saveUiState();
};
</script>

<template>
  <div id="design" class="w-full h-full"></div>

  <!-- hint overlay -->
  <Transition name="fade">
    <div
      v-if="!pointerLocked && !exportModalVisible"
      class="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none"
    >
      <div class="bg-black/60 text-white text-sm px-4 py-2 rounded-full tracking-wide">
        🖱 Click to control &nbsp;·&nbsp;
        <kbd class="font-mono">WASD</kbd> move &nbsp;·&nbsp;
        <kbd class="font-mono">Q/E</kbd> up/down &nbsp;·&nbsp;
        scroll dolly &nbsp;·&nbsp;
        <kbd class="font-mono">ESC</kbd> release
      </div>
    </div>
  </Transition>

  <!-- menu -->
  <div class="absolute top-2 right-2 dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-sm btn-outline btn-primary bg-base-100">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4">
        <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="currentColor"></path>
      </svg>
    </div>
    <MainMenu
      :toggleGrid="toggleGrid"
      :toggleAxis="toggleAxis"
      :toggleProjection="toggleProjection"
      :toggleRotateX="toggleRotateX"
      :toggleRotateY="toggleRotateY"
      :toggleRotateZ="toggleRotateZ"
      :showExportModal="showExportModal"
      :resetViewport="resetViewport"
      :uiState="uiState"
    />
  </div>

  <!-- Export modal -->
  <div
    v-if="exportModalVisible"
    class="absolute top-0 left-0 right-0 bottom-0 grid items-center justify-center"
  >
    <div class="p-2 shadow bg-base-100 border border-primary">
      <label for="exportName">Export file name:</label>
      <input class="w-full p-2 my-2" type="text" id="exportName" name="exportName" v-model="exportName" />
      <div v-if="exportError" class="text-error">Error: {{ exportError }}</div>
      <div v-if="!exporting" class="flex gap-4">
        <a v-on:click="export3mf" class="btn btn-primary btn-outline"><span class="flex-1">Export 3MF</span></a>
        <a v-on:click="exportX3d"  class="btn btn-primary btn-outline"><span class="flex-1">Export X3D</span></a>
        <a v-on:click="exportSvg"  class="btn btn-primary btn-outline"><span class="flex-1">Export SVG</span></a>
        <a v-on:click="hideExportModal" class="btn btn-neutral btn-outline ml-4"><span class="flex-1">Close</span></a>
      </div>
      <div v-else class="flex gap-4 items-center justify-center">
        <span class="loading loading-spinner loading-sm"></span>
        <span class="p-4">Exporting...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

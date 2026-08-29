```javascript
/* =========================================================
   THUMBNAIL STUDIO
   Core Editor
   ========================================================= */


/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */

const state = {

  canvasWidth: 1280,
  canvasHeight: 720,

  zoom: 0.60,

  elements: [],

  selectedId: null,

  nextId: 1,

  history: [],

  historyIndex: -1

};


/* ---------------------------------------------------------
   DOM
--------------------------------------------------------- */

const canvas = document.getElementById("canvas");
const canvasWrapper = document.getElementById("canvasWrapper");
const layersPanel = document.getElementById("layers");
const propertiesPanel = document.getElementById("properties");

const zoomLabel = document.getElementById("zoomLabel");

const cursorX = document.getElementById("cursorX");
const cursorY = document.getElementById("cursorY");

const imageInput = document.getElementById("imageInput");


/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

function generateId() {

  return `element-${state.nextId++}`;

}


function getElement(id) {

  return state.elements.find(element => element.id === id);

}


function getSelectedElement() {

  return getElement(state.selectedId);

}


/* ---------------------------------------------------------
   HISTORY
--------------------------------------------------------- */

function saveHistory() {

  const snapshot = JSON.stringify({
    elements: state.elements,
    nextId: state.nextId
  });

  state.history =
    state.history.slice(0, state.historyIndex + 1);

  state.history.push(snapshot);

  state.historyIndex++;

  if (state.history.length > 50) {

    state.history.shift();

    state.historyIndex--;

  }

}


function restoreHistory(snapshot) {

  const data = JSON.parse(snapshot);

  state.elements = data.elements;

  state.nextId = data.nextId;

  state.selectedId = null;

  render();

}


function undo() {

  if (state.historyIndex <= 0) return;

  state.historyIndex--;

  restoreHistory(
    state.history[state.historyIndex]
  );

}


function redo() {

  if (
    state.historyIndex >=
    state.history.length - 1
  ) return;

  state.historyIndex++;

  restoreHistory(
    state.history[state.historyIndex]
  );

}


/* ---------------------------------------------------------
   ZOOM
--------------------------------------------------------- */

function setZoom(value) {

  state.zoom = Math.max(
    0.15,
    Math.min(2, value)
  );

  canvas.style.transform =
    `scale(${state.zoom})`;

  zoomLabel.textContent =
    `${Math.round(state.zoom * 100)}%`;

}


function fitCanvas() {

  const rect =
    canvasWrapper.getBoundingClientRect();

  const padding = 100;

  const availableWidth =
    rect.width - padding;

  const availableHeight =
    rect.height - padding;

  const scaleX =
    availableWidth / state.canvasWidth;

  const scaleY =
    availableHeight / state.canvasHeight;

  setZoom(
    Math.min(scaleX, scaleY, 1)
  );

}


/* ---------------------------------------------------------
   CREATE TEXT
--------------------------------------------------------- */

function createText() {

  const id = generateId();

  const element = {

    id,

    type: "text",

    name: "Text",

    text: "Your Text",

    x: 100,

    y: 100,

    width: 350,

    height: 100,

    fontFamily: "Cairo",

    fontSize: 72,

    fontWeight: 900,

    color: "#ffffff",

    strokeColor: "#000000",

    strokeWidth: 0,

    opacity: 1,

    rotation: 0,

    shadow: true

  };

  state.elements.push(element);

  state.selectedId = id;

  saveHistory();

  render();

}


/* ---------------------------------------------------------
   CREATE IMAGE
--------------------------------------------------------- */

function openImagePicker() {

  imageInput.value = "";

  imageInput.click();

}


imageInput.addEventListener(
  "change",
  function(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

      const id = generateId();

      const element = {

        id,

        type: "image",

        name: file.name,

        src: e.target.result,

        x: 100,

        y: 100,

        width: 400,

        height: 300,

        opacity: 1,

        rotation: 0

      };

      state.elements.push(element);

      state.selectedId = id;

      saveHistory();

      render();

    };

    reader.readAsDataURL(file);

  }
);


/* ---------------------------------------------------------
   RENDER
--------------------------------------------------------- */

function render() {

  canvas
    .querySelectorAll(".canvas-element")
    .forEach(el => el.remove());


  state.elements.forEach(element => {

    let node;


    /* TEXT */

    if (element.type === "text") {

      node =
        document.createElement("div");

      node.className =
        "canvas-element text-element";

      node.textContent =
        element.text;

      node.style.fontFamily =
        `"${element.fontFamily}", sans-serif`;

      node.style.fontSize =
        `${element.fontSize}px`;

      node.style.fontWeight =
        element.fontWeight;

      node.style.color =
        element.color;

      node.style.opacity =
        element.opacity;

      node.style.left =
        `${element.x}px`;

      node.style.top =
        `${element.y}px`;

      node.style.transform =
        `rotate(${element.rotation}deg)`;

      if (element.strokeWidth > 0) {

        node.style.webkitTextStroke =
          `${element.strokeWidth}px ${element.strokeColor}`;

      }

      if (element.shadow) {

        node.style.textShadow =
          "6px 6px 0 #000";

      } else {

        node.style.textShadow =
          "none";

      }

    }


    /* IMAGE */

    if (element.type === "image") {

      node =
        document.createElement("img");

      node.className =
        "canvas-element image-element";

      node.src =
        element.src;

      node.style.width =
        `${element.width}px`;

      node.style.height =
        `${element.height}px`;

      node.style.opacity =
        element.opacity;

      node.style.left =
        `${element.x}px`;

      node.style.top =
        `${element.y}px`;

      node.style.transform =
        `rotate(${element.rotation}deg)`;

    }


    if (!node) return;

    node.dataset.id =
      element.id;

    if (state.selectedId === element.id) {

      node.classList.add("selected");

    }


    node.addEventListener(
      "mousedown",
      startDrag
    );

    canvas.appendChild(node);

  });


  renderLayers();

  renderProperties();

}


/* ---------------------------------------------------------
   LAYERS
--------------------------------------------------------- */

function renderLayers() {

  layersPanel.innerHTML = "";

  const reversed =
    [...state.elements].reverse();


  reversed.forEach(element => {

    const item =
      document.createElement("div");

    item.className =
      "layer-item";

    if (state.selectedId === element.id) {

      item.classList.add("selected");

    }


    const icon =
      element.type === "text"
        ? "T"
        : "▧";


    item.innerHTML = `

      <div class="layer-icon">
        ${icon}
      </div>

      <div class="layer-name">
        ${escapeHTML(element.name)}
      </div>

      <div class="layer-visibility">
        ●
      </div>

    `;


    item.addEventListener(
      "click",
      () => {

        state.selectedId =
          element.id;

        render();

      }
    );


    layersPanel.appendChild(item);

  });


  const background =
    document.createElement("div");

  background.className =
    "layer-item background-item";

  if (!state.selectedId) {

    background.classList.add("selected");

  }

  background.innerHTML = `

    <div class="layer-icon">
      ◐
    </div>

    <div class="layer-name">
      Background
    </div>

    <div class="layer-visibility">
      ●
    </div>

  `;

  layersPanel.appendChild(background);

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* ---------------------------------------------------------
   PROPERTIES
--------------------------------------------------------- */

function renderProperties() {

  const element =
    getSelectedElement();


  if (!element) {

    propertiesPanel.innerHTML = `

      <div class="empty-properties">

        <div class="empty-icon">✦</div>

        <strong>No element selected</strong>

        <span>
          Select an element to edit its properties.
        </span>

      </div>

    `;

    return;

  }


  if (element.type === "text") {

    renderTextProperties(element);

  }


  if (element.type === "image") {

    renderImageProperties(element);

  }

}


/* ---------------------------------------------------------
   TEXT PROPERTIES
--------------------------------------------------------- */

function renderTextProperties(element) {

  propertiesPanel.innerHTML = `

    <div class="property-group">

      <div class="property-label">
        <span>Text</span>
      </div>

      <input
        class="property-input"
        id="propText"
        value="${escapeHTML(element.text)}"
      >

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Font</span>
      </div>

      <select
        class="property-input"
        id="propFont"
      >

        <option value="Cairo">
          Cairo
        </option>

        <option value="Inter">
          Inter
        </option>

        <option value="Anton">
          Anton
        </option>

        <option value="Bebas Neue">
          Bebas Neue
        </option>

      </select>

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Size</span>
        <span id="fontSizeValue">
          ${element.fontSize}px
        </span>
      </div>

      <input
        type="range"
        id="propSize"
        min="10"
        max="250"
        value="${element.fontSize}"
      >

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Weight</span>
      </div>

      <select
        class="property-input"
        id="propWeight"
      >

        <option value="300">Light</option>
        <option value="400">Regular</option>
        <option value="600">Semi Bold</option>
        <option value="700">Bold</option>
        <option value="800">Extra Bold</option>
        <option value="900">Black</option>

      </select>

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Text Color</span>
      </div>

      <input
        type="color"
        class="color-input"
        id="propColor"
        value="${element.color}"
      >

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Stroke</span>
        <span id="strokeValue">
          ${element.strokeWidth}px
        </span>
      </div>

      <input
        type="range"
        id="propStroke"
        min="0"
        max="30"
        value="${element.strokeWidth}"
      >

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Stroke Color</span>
      </div>

      <input
        type="color"
        class="color-input"
        id="propStrokeColor"
        value="${element.strokeColor}"
      >

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Opacity</span>
        <span id="opacityValue">
          ${Math.round(element.opacity * 100)}%
        </span>
      </div>

      <input
        type="range"
        id="propOpacity"
        min="0"
        max="100"
        value="${element.opacity * 100}"
      >

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Position</span>
      </div>

      <div class="property-row">

        <input
          class="property-input"
          id="propX"
          type="number"
          value="${Math.round(element.x)}"
          placeholder="X"
        >

        <input
          class="property-input"
          id="propY"
          type="number"
          value="${Math.round(element.y)}"
          placeholder="Y"
        >

      </div>

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Rotation</span>
        <span id="rotationValue">
          ${element.rotation}°
        </span>
      </div>

      <input
        type="range"
        id="propRotation"
        min="-180"
        max="180"
        value="${element.rotation}"
      >

    </div>


    <div class="property-group">

      <label style="
        display:flex;
        align-items:center;
        gap:8px;
        color:#9aa1ac;
        font-size:10px;
      ">

        <input
          type="checkbox"
          id="propShadow"
          ${element.shadow ? "checked" : ""}
        >

        Text Shadow

      </label>

    </div>

  `;


  document.getElementById("propFont").value =
    element.fontFamily;

  document.getElementById("propWeight").value =
    element.fontWeight;


  bindTextProperty(
    "propText",
    value => element.text = value
  );

  bindTextProperty(
    "propFont",
    value => element.fontFamily = value
  );

  bindTextProperty(
    "propWeight",
    value => element.fontWeight = Number(value)
  );

  bindTextProperty(
    "propColor",
    value => element.color = value
  );

  bindTextProperty(
    "propStrokeColor",
    value => element.strokeColor = value
  );

  bindTextProperty(
    "propX",
    value => element.x = Number(value)
  );

  bindTextProperty(
    "propY",
    value => element.y = Number(value)
  );


  document.getElementById("propSize")
    .addEventListener("input", e => {

      element.fontSize =
        Number(e.target.value);

      document.getElementById(
        "fontSizeValue"
      ).textContent =
        `${element.fontSize}px`;

      renderCanvasOnly();

    });


  document.getElementById("propStroke")
    .addEventListener("input", e => {

      element.strokeWidth =
        Number(e.target.value);

      document.getElementById(
        "strokeValue"
      ).textContent =
        `${element.strokeWidth}px`;

      renderCanvasOnly();

    });


  document.getElementById("propOpacity")
    .addEventListener("input", e => {

      element.opacity =
        Number(e.target.value) / 100;

      document.getElementById(
        "opacityValue"
      ).textContent =
        `${Math.round(element.opacity * 100)}%`;

      renderCanvasOnly();

    });


  document.getElementById("propRotation")
    .addEventListener("input", e => {

      element.rotation =
        Number(e.target.value);

      document.getElementById(
        "rotationValue"
      ).textContent =
        `${element.rotation}°`;

      renderCanvasOnly();

    });


  document.getElementById("propShadow")
    .addEventListener("change", e => {

      element.shadow =
        e.target.checked;

      renderCanvasOnly();

    });

}


function bindTextProperty(id, callback) {

  const input =
    document.getElementById(id);

  input.addEventListener(
    "input",
    e => {

      callback(e.target.value);

      renderCanvasOnly();

    }
  );

}


/* ---------------------------------------------------------
   IMAGE PROPERTIES
--------------------------------------------------------- */

function renderImageProperties(element) {

  propertiesPanel.innerHTML = `

    <div class="property-group">

      <div class="property-label">
        <span>Size</span>
      </div>

      <div class="property-row">

        <input
          class="property-input"
          id="propWidth"
          type="number"
          value="${Math.round(element.width)}"
        >

        <input
          class="property-input"
          id="propHeight"
          type="number"
          value="${Math.round(element.height)}"
        >

      </div>

    </div>


    <div class="property-group">

      <div class="property-label">
        <span>Position</span>
      </div>

      <div class="property-row">

        <input
          class="property-input"
          id="propX"
          type="number"
          value="${Math.round(element.x)}"
        >

        <input
          class="property-input"
          id="propY"
          type="number"
          value="${Math.round(element.y)}"
        >

      </div>

    </div>


    <div class="property-group">

      <div class="property-label">

        <span>Opacity</span>

        <span id="opacityValue">
          ${Math.round(element.opacity * 100)}%
        </span>

      </div>

      <input
        type="range"
        id="propOpacity"
        min="0"
        max="100"
        value="${element.opacity * 100}"
      >

    </div>


    <div class="property-group">

      <div class="property-label">

        <span>Rotation</span>

        <span id="rotationValue">
          ${element.rotation}°
        </span>

      </div>

      <input
        type="range"
        id="propRotation"
        min="-180"
        max="180"
        value="${element.rotation}"
      >

    </div>

  `;


  bindTextProperty(
    "propWidth",
    value => element.width = Number(value)
  );

  bindTextProperty(
    "propHeight",
    value => element.height = Number(value)
  );

  bindTextProperty(
    "propX",
    value => element.x = Number(value)
  );

  bindTextProperty(
    "propY",
    value => element.y = Number(value)
  );


  document.getElementById("propOpacity")
    .addEventListener("input", e => {

      element.opacity =
        Number(e.target.value) / 100;

      document.getElementById(
        "opacityValue"
      ).textContent =
        `${Math.round(element.opacity * 100)}%`;

      renderCanvasOnly();

    });


  document.getElementById("propRotation")
    .addEventListener("input", e => {

      element.rotation =
        Number(e.target.value);

      document.getElementById(
        "rotationValue"
      ).textContent =
        `${element.rotation}°`;

      renderCanvasOnly();

    });

}


/* ---------------------------------------------------------
   CANVAS ONLY RENDER
--------------------------------------------------------- */

function renderCanvasOnly() {

  const oldSelection =
    state.selectedId;

  render();

  state.selectedId =
    oldSelection;

}


/* ---------------------------------------------------------
   DRAGGING
--------------------------------------------------------- */

let drag = {

  active: false,

  id: null,

  startMouseX: 0,
  startMouseY: 0,

  startX: 0,
  startY: 0

};


function startDrag(event) {

  event.preventDefault();

  const id =
    event.currentTarget.dataset.id;

  const element =
    getElement(id);

  if (!element) return;

  state.selectedId =
    id;

  drag.active = true;

  drag.id = id;

  drag.startMouseX =
    event.clientX;

  drag.startMouseY =
    event.clientY;

  drag.startX =
    element.x;

  drag.startY =
    element.y;

  render();

}


document.addEventListener(
  "mousemove",
  event => {

    if (!drag.active) return;

    const element =
      getElement(drag.id);

    if (!element) return;


    const deltaX =
      (event.clientX - drag.startMouseX)
      / state.zoom;

    const deltaY =
      (event.clientY - drag.startMouseY)
      / state.zoom;


    element.x =
      drag.startX + deltaX;

    element.y =
      drag.startY + deltaY;


    cursorX.textContent =
      `X: ${Math.round(element.x)}`;

    cursorY.textContent =
      `Y: ${Math.round(element.y)}`;


    renderCanvasOnly();

  }
);


document.addEventListener(
  "mouseup",
  () => {

    if (!drag.active) return;

    drag.active = false;

    saveHistory();

  }
);


/* ---------------------------------------------------------
   DELETE
--------------------------------------------------------- */

function deleteSelected() {

  if (!state.selectedId) return;

  state.elements =
    state.elements.filter(
      element =>
        element.id !== state.selectedId
    );

  state.selectedId = null;

  saveHistory();

  render();

}


/* ---------------------------------------------------------
   DUPLICATE
--------------------------------------------------------- */

function duplicateSelected() {

  const element =
    getSelectedElement();

  if (!element) return;

  const copy =
    JSON.parse(
      JSON.stringify(element)
    );

  copy.id =
    generateId();

  copy.name =
    `${element.name} Copy`;

  copy.x += 30;

  copy.y += 30;

  state.elements.push(copy);

  state.selectedId =
    copy.id;

  saveHistory();

  render();

}


/* ---------------------------------------------------------
   EXPORT
--------------------------------------------------------- */

function exportThumbnail() {

  const exportCanvas =
    document.createElement("canvas");

  exportCanvas.width =
    state.canvasWidth;

  exportCanvas.height =
    state.canvasHeight;

  const ctx =
    exportCanvas.getContext("2d");


  /* BACKGROUND */

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      state.canvasWidth,
      state.canvasHeight
    );

  gradient.addColorStop(
    0,
    "#161a21"
  );

  gradient.addColorStop(
    1,
    "#303741"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    state.canvasWidth,
    state.canvasHeight
  );


  let remaining =
    state.elements.length;


  if (remaining === 0) {

    downloadCanvas(
      exportCanvas
    );

    return;

  }


  state.elements.forEach(element => {

    if (element.type === "text") {

      drawTextToCanvas(
        ctx,
        element
      );

      remaining--;

      if (remaining === 0) {

        downloadCanvas(
          exportCanvas
        );

      }

    }


    if (element.type === "image") {

      const image =
        new Image();

      image.onload = () => {

        ctx.save();

        ctx.globalAlpha =
          element.opacity;

        ctx.translate(
          element.x + element.width / 2,
          element.y + element.height / 2
        );

        ctx.rotate(
          element.rotation *
          Math.PI / 180
        );

        ctx.drawImage(
          image,
          -element.width / 2,
          -element.height / 2,
          element.width,
          element.height
        );

        ctx.restore();

        remaining--;

        if (remaining === 0) {

          downloadCanvas(
            exportCanvas
          );

        }

      };

      image.src =
        element.src;

    }

  });

}


function drawTextToCanvas(ctx, element) {

  ctx.save();

  ctx.globalAlpha =
    element.opacity;

  ctx.font =
    `${element.fontWeight} ${element.fontSize}px "${element.fontFamily}"`;

  ctx.textBaseline =
    "top";

  ctx.translate(
    element.x,
    element.y
  );

  ctx.rotate(
    element.rotation *
    Math.PI / 180
  );


  if (element.shadow) {

    ctx.shadowColor =
      "#000000";

    ctx.shadowBlur =
      0;

    ctx.shadowOffsetX =
      6;

    ctx.shadowOffsetY =
      6;

  }


  if (element.strokeWidth > 0) {

    ctx.lineWidth =
      element.strokeWidth * 2;

    ctx.strokeStyle =
      element.strokeColor;

    ctx.strokeText(
      element.text,
      0,
      0
    );

  }


  ctx.fillStyle =
    element.color;

  ctx.fillText(
    element.text,
    0,
    0
  );

  ctx.restore();

}


function downloadCanvas(canvas) {

  const link =
    document.createElement("a");

  link.download =
    "thumbnail.png";

  link.href =
    canvas.toDataURL(
      "image/png",
      1
    );

  link.click();

}


/* ---------------------------------------------------------
   NEW PROJECT
--------------------------------------------------------- */

function newProject() {

  const confirmed =
    confirm(
      "Create a new thumbnail?"
    );

  if (!confirmed) return;

  state.elements = [];

  state.selectedId = null;

  state.nextId = 1;

  saveHistory();

  render();

  fitCanvas();

}


/* ---------------------------------------------------------
   FULLSCREEN
--------------------------------------------------------- */

function toggleFullscreen() {

  if (!document.fullscreenElement) {

    document.documentElement
      .requestFullscreen()
      .catch(() => {});

  } else {

    document.exitFullscreen();

  }

}


/* ---------------------------------------------------------
   BUTTONS
--------------------------------------------------------- */

document.getElementById(
  "addTextBtn"
).addEventListener(
  "click",
  createText
);


document.getElementById(
  "uploadImageBtn"
).addEventListener(
  "click",
  openImagePicker
);


document.getElementById(
  "deleteBtn"
).addEventListener(
  "click",
  deleteSelected
);


document.getElementById(
  "duplicateBtn"
).addEventListener(
  "click",
  duplicateSelected
);


document.getElementById(
  "undoBtn"
).addEventListener(
  "click",
  undo
);


document.getElementById(
  "redoBtn"
).addEventListener(
  "click",
  redo
);


document.getElementById(
  "exportBtn"
).addEventListener(
  "click",
  exportThumbnail
);


document.getElementById(
  "newProjectBtn"
).addEventListener(
  "click",
  newProject
);


document.getElementById(
  "zoomInBtn"
).addEventListener(
  "click",
  () => setZoom(state.zoom + .1)
);


document.getElementById(
  "zoomOutBtn"
).addEventListener(
  "click",
  () => setZoom(state.zoom - .1)
);


document.getElementById(
  "fitBtn"
).addEventListener(
  "click",
  fitCanvas
);


document.getElementById(
  "fullscreenBtn"
).addEventListener(
  "click",
  toggleFullscreen
);


/* ---------------------------------------------------------
   TOOLBAR
--------------------------------------------------------- */

document.querySelectorAll(".tool").forEach(tool => {

  tool.addEventListener(
    "click",
    () => {

      document
        .querySelectorAll(".tool")
        .forEach(t =>
          t.classList.remove("active")
        );

      tool.classList.add("active");

    }
  );

});


/* ---------------------------------------------------------
   CANVAS COORDINATES
--------------------------------------------------------- */

canvas.addEventListener(
  "mousemove",
  event => {

    const rect =
      canvas.getBoundingClientRect();

    const x =
      (event.clientX - rect.left)
      / state.zoom;

    const y =
      (event.clientY - rect.top)
      / state.zoom;

    cursorX.textContent =
      `X: ${Math.round(x)}`;

    cursorY.textContent =
      `Y: ${Math.round(y)}`;

  }
);


/* ---------------------------------------------------------
   KEYBOARD
--------------------------------------------------------- */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Delete" ||
      event.key === "Backspace"
    ) {

      const active =
        document.activeElement;

      if (
        active &&
        (
          active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT"
        )
      ) {

        return;

      }

      deleteSelected();

    }


    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "z"
    ) {

      event.preventDefault();

      undo();

    }


    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "y"
    ) {

      event.preventDefault();

      redo();

    }

  }
);


/* ---------------------------------------------------------
   START
--------------------------------------------------------- */

saveHistory();

render();

window.addEventListener(
  "resize",
  fitCanvas
);

setTimeout(
  fitCanvas,
  100
);
```

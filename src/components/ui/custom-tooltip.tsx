const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: inline-block; position: relative; }
    .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 0.5rem;
      white-space: nowrap;
      background: #1f2937;
      color: #fff;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 10;
    }
    :host(:hover) .tooltip,
    :host(:focus-within) .tooltip {
      opacity: 1;
    }
  </style>
  <slot></slot>
  <div class="tooltip" part="tooltip-text"></div>
`;

export class TooltipElement extends HTMLElement {
  static get observedAttributes() {
    return ["content"];
  }

  private _tooltipDiv!: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(template.content.cloneNode(true));
    this._tooltipDiv = shadow.querySelector(".tooltip") as HTMLDivElement;
  }

  connectedCallback() {
    if (this.hasAttribute("content")) {
      this._updateText();
    }
  }

  attributeChangedCallback(name: string) {
    if (name === "content") {
      this._updateText();
    }
  }

  private _updateText() {
    this._tooltipDiv.textContent = this.getAttribute("content") || "";
  }
}

customElements.define("x-tooltip", TooltipElement);

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { SvgToolbar } from "./svg-toolbar";
import { SvgPreview } from "./svg-preview";

import { optimize, type Config as SvgoConfig } from "svgo";
import { inflate } from "pako";
import CodeMirror from "@uiw/react-codemirror";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";

const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="28" y="28" width="144" height="144" rx="28" fill="#2f6bdb"/>
  <rect x="56" y="52" width="88" height="24" rx="6" fill="#fff"/>
  <rect x="64" y="84" width="72" height="68" rx="8" fill="#e7f0ff"/>
  <path d="M86 128 l18 16 40-48" stroke="#2f6bdb" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function svgToDataUri(svg: string) {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function downloadBlob(filename: string, data: Blob | string, type?: string) {
  const blob = typeof data === "string" ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}



const buildSvgoConfig = (overrides: Record<string, boolean>): SvgoConfig => ({
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides,
      },
    },
  ],
});

export function SvgViewer() {
  const [svg, setSvg] = useState<string>(() => localStorage.getItem("svg-viewer:last") ?? SAMPLE_SVG);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [grid, setGrid] = useState<boolean>(false);
  const [bgTransparent, setBgTransparent] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [svgoFlags] = useState<Record<string, boolean>>({
    // overrides for preset-default
    removeViewBox: false, // keep viewBox by default
    removeDimensions: false,
    convertStyleToAttrs: true,
    cleanupIDs: true,
    removeComments: true,
    collapseGroups: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem("svg-viewer:last", svg);
  }, [svg]);

  // Validate minimal SVG structure
  const isValid = useMemo(() => /<svg[\s\S]*?>[\s\S]*<\/svg>/i.test(svg.trim()), [svg]);

  useEffect(() => {
    if (svg.trim().length === 0) setError("");
    else if (!isValid) setError("Invalid or incomplete SVG");
    else setError(null);
  }, [svg, isValid]);

  const onUpload = useCallback((file: File) => {
    const reader = new FileReader();
    const isGz = file.name.endsWith(".svgz") || file.type === "image/svg+xml-compressed";
    if (isGz) {
      reader.onload = () => {
        try {
          const buf = new Uint8Array(reader.result as ArrayBuffer);
          const xmlText = new TextDecoder().decode(inflate(buf));
          setSvg(xmlText);
        } catch {
          // fallback ignore
        }
        setDragOver(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = () => {
        const xmlText = String(reader.result ?? "");
        setSvg(xmlText);
        setDragOver(false);
      };
      reader.readAsText(file);
    }
  }, []);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && (f.type.includes("svg") || f.name.endsWith(".svg"))) onUpload(f);
  };

  const exportPNG = (scale: number = 2) => {
    try {
      const dataUrl = svgToDataUri(svg);
      const img = new Image();
      img.decoding = "sync";
      img.onload = async () => {
        const match = svg.match(/viewBox\s*=\s*"([^"]+)"/i);
        let w = 512, h = 512;
        if (match) {
          const vb = match[1].split(/\s+/).map(Number);
          if (vb.length === 4) { w = vb[2]; h = vb[3]; }
        } else {
          const wMatch = svg.match(/width\s*=\s*"(\d+(?:\.\d+)?)"/i);
          const hMatch = svg.match(/height\s*=\s*"(\d+(?:\.\d+)?)"/i);
          if (wMatch && hMatch) { w = parseFloat(wMatch[1]); h = parseFloat(hMatch[1]); }
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(w * scale));
        canvas.height = Math.max(1, Math.floor(h * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        if (!bgTransparent) { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => { if (blob) downloadBlob(`export@${scale}x.png`, blob); }, "image/png");
      };
      img.onerror = () => console.error("Failed to load SVG for export");
      img.src = dataUrl;
    } catch (e) { console.error(e); }
  };



  const optimizeSvg = () => {
    const cfg = buildSvgoConfig(svgoFlags);
    const { data } = optimize(svg, cfg);
    setSvg(data);
  };

  // Toolbar handlers
  const handleFileLoad = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleSample = useCallback(() => {
    setSvg(SAMPLE_SVG);
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text?.includes("<svg")) {
        setSvg(text);
      }
    } catch (err) {
      console.error("Failed to paste: ", err);
    }
  }, []);

  const handleDownload = useCallback(() => {
    downloadBlob("graphic.svg", svg, "image/svg+xml");
  }, [svg]);

  const handleCopy = useCallback(() => {
    copyText(svg);
  }, [svg]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(500, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(25, prev - 25));
  }, []);

  const handleZoomFit = useCallback(() => {
    // TODO: Implement fit to view logic
    setZoom(100);
  }, []);

  const handleZoomActual = useCallback(() => {
    setZoom(100);
  }, []);

  const reactJSX = useMemo(() => {
    const toCamel = (name: string) =>
      name
        .split("-")
        .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
        .join("");

    const replaced = svg
      .replace(/\sclass=/g, " className=")
      .replace(/\sfor=/g, " htmlFor=")
      // Replace attribute names safely: [delim]attr=
      .replace(/([\s<])([a-zA-Z_:][\w:.-]*)(=)/g, (_m, d, attr, eq) => {
        const a: string = String(attr);
        if (a.startsWith("data-") || a.startsWith("aria-")) return `${d}${a}${eq}`;
        if (a === "class") return `${d}className${eq}`;
        if (a.includes("-")) return `${d}${toCamel(a)}${eq}`;
        return `${d}${a}${eq}`;
      });

    return `function Icon(props) {\n  return (\n    ${replaced}\n  );\n}\nexport default Icon;`;
  }, [svg]);

  const onFileInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) onUpload(f);
  };



  return (
    <div className="flex flex-col h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/svg+xml,.svg"
        aria-label="Upload SVG"
        onChange={onFileInput}
        className="hidden"
      />

      {/* Toolbar */}
      <SvgToolbar
        onFileLoad={handleFileLoad}
        onSample={handleSample}
        onPaste={handlePaste}
        onOptimize={optimizeSvg}
        onDownload={handleDownload}
        onCopy={handleCopy}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onZoomActual={handleZoomActual}
        onToggleGrid={() => setGrid(!grid)}
        onToggleBackground={() => setBgTransparent(!bgTransparent)}
        zoom={zoom}
        grid={grid}
        bgTransparent={bgTransparent}
        onExportPng={exportPNG}
        onCopyReactComponent={() => copyText(reactJSX)}
      />

      {/* Main content area */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {/* Left: Code Editor */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <h3 className="text-lg font-semibold">SVG Code</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <div className="h-[520px]">
                <CodeMirror
                  height="520px"
                  value={svg}
                  onChange={(v) => setSvg(v)}
                  extensions={[xml()]}
                  theme={oneDark}
                />
              </div>
              {error ? (
                <div className="p-4 border-t border-divider">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              ) : (
                <div className="p-4 border-t border-divider">
                  <p className="text-default-500 text-xs">Tip: drag & drop an .svg file anywhere.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <SvgPreview
            svg={svg}
            isValid={isValid}
            zoom={zoom}
            onZoomChange={setZoom}
            grid={grid}
            onGridChange={setGrid}
            bgTransparent={bgTransparent}
            onBgTransparentChange={setBgTransparent}
            bgColor={bgColor}
            onBgColorChange={setBgColor}
            dragOver={dragOver}
          />
        </div>

      </div>
    </div>
  );
}

export default SvgViewer;

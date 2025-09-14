import { useRef, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { cn } from "@heroui/theme";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { Switch } from "@heroui/switch";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";

interface SvgPreviewProps {
  svg: string;
  isValid: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  grid: boolean;
  onGridChange: (grid: boolean) => void;
  bgTransparent: boolean;
  onBgTransparentChange: (transparent: boolean) => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
  dragOver: boolean;
  footer?: ReactNode;
}

function svgToDataUri(svg: string): string {
  // Modern approach: URL encode the SVG and use it directly in data URI
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

export function SvgPreview({
  svg,
  isValid,
  zoom,
  onZoomChange,
  grid,
  onGridChange,
  bgTransparent,
  onBgTransparentChange,
  bgColor,
  onBgColorChange,
  dragOver,
  footer,
}: SvgPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // rAF-throttled background color updates for smooth dragging
  const rafIdRef = useRef<number | null>(null);
  const pendingBgRef = useRef<string | null>(null);
  const scheduleBgColor = useCallback(
    (color: string) => {
      pendingBgRef.current = color;
      if (rafIdRef.current !== null) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (pendingBgRef.current !== null) {
          onBgColorChange(pendingBgRef.current);
        }
      });
    },
    [onBgColorChange],
  );
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);



  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    const newZoom = Math.max(25, Math.min(500, zoom + delta));
    onZoomChange(newZoom);
  }, [zoom, onZoomChange]);

  const resetPan = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    if (isPanning) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isPanning]);

  const svgDataUri = useMemo(() => svgToDataUri(svg), [svg]);

  return (
    <Card className="h-full">
      <CardHeader className="flex justify-between items-center pb-2">
        <h3 className="text-lg font-semibold">Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="light"
            onPress={() => onZoomChange(100)}
          >
            Reset Zoom
          </Button>
          <Button
            size="sm"
            variant="light"
            onPress={resetPan}
          >
            Reset Pan
          </Button>
        </div>
      </CardHeader>
      
      <Divider />
      
      <CardBody className="p-0">
        {/* Controls */}
        <div className="p-4 border-b border-divider">
          <div className="flex flex-col gap-4">
            {/* Zoom Control */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium min-w-[60px]">Zoom:</label>
              <Slider
                size="sm"
                step={5}
                minValue={25}
                maxValue={500}
                value={zoom}
                onChange={(value: number | number[]) => onZoomChange(Array.isArray(value) ? value[0] : value)}
                className="flex-1"
                showTooltip
              />
              <Input
                size="sm"
                type="number"
                value={zoom.toString()}
                onChange={(e) => onZoomChange(parseInt(e.target.value) || 100)}
                endContent="%"
                className="w-20"
                min={25}
                max={500}
              />
            </div>

            {/* Display Options */}
            <div className="flex items-center gap-6">
              <Switch
                size="sm"
                isSelected={grid}
                onValueChange={onGridChange}
              >
                Grid
              </Switch>
              <Switch
                size="sm"
                isSelected={bgTransparent}
                onValueChange={onBgTransparentChange}
              >
                Transparent BG
              </Switch>
              {!bgTransparent && (
                <div className="flex items-center gap-2">
                  <label className="text-sm">Background:</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => scheduleBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-divider cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div
          ref={previewRef}
          className={cn(
            "relative flex-1 overflow-hidden",
            grid && "bg-[radial-gradient(circle,_#00000020_1px,_transparent_1px)]",
            grid && "[background-size:20px_20px]",
            isPanning ? "cursor-grabbing" : "cursor-grab",
          )}
          style={{
            backgroundColor: bgTransparent ? "transparent" : bgColor,
            minHeight: "400px",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {dragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary">
              <div className="text-center">
                <div className="text-2xl mb-2">📁</div>
                <span className="text-primary font-medium">Drop SVG file to load</span>
              </div>
            </div>
          )}
          
          {isValid ? (
            <div
              className="flex items-center justify-center w-full h-full"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              }}
            >
              <img
                alt="SVG preview"
                src={svgDataUri}
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "center center",
                  maxWidth: "none",
                  maxHeight: "none",
                }}
                draggable={false}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-default-500">
              <div className="text-center">
                <div className="text-4xl mb-4">📄</div>
                <p>Paste valid SVG to preview</p>
              </div>
            </div>
          )}
        </div>

        {footer && (
          <div className="border-t border-divider p-4">
            {footer}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

import { useId, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tabs, Tab } from "@heroui/tabs";
import { Switch } from "@heroui/switch";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Snippet } from "@heroui/snippet";
import { Divider } from "@heroui/divider";
import { Accordion, AccordionItem } from "@heroui/accordion";

interface SvgPropertiesProps {
  svg: string;
  isValid: boolean;
  svgoFlags: Record<string, boolean>;
  onSvgoFlagsChange: (flags: Record<string, boolean>) => void;
  optimizeOnLoad: boolean;
  onOptimizeOnLoadChange: (value: boolean) => void;
  optStats: { before: number; after: number } | null;
  scalesInput: string;
  onScalesInputChange: (value: string) => void;
  onExportPng: (scale: number) => void;
  onCopyReactComponent: () => void;
  reactJSX: string;
  embedded?: boolean;
}

export function SvgProperties({
  svg,
  isValid,
  svgoFlags,
  onSvgoFlagsChange,
  optimizeOnLoad,
  onOptimizeOnLoadChange,
  optStats,
  scalesInput,
  onScalesInputChange,
  onExportPng,
  onCopyReactComponent,
  reactJSX,
  embedded,
}: SvgPropertiesProps) {
  const [selectedTab, setSelectedTab] = useState("info");
  const scalesId = useId();

  // Extract SVG info
  const svgInfo = isValid ? extractSvgInfo(svg) : null;

  const content = (
    <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key: unknown) => setSelectedTab(String(key))}
          className="w-full"
          variant="underlined"
        >
          <Tab key="info" title="Info">
            <div className="p-4 space-y-4">
              {svgInfo ? (
                <div className="space-y-3">
                  <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-sm items-center">
                    <dt className="text-default-500 text-right whitespace-nowrap">Dimensions</dt>
                    <dd className="font-mono whitespace-nowrap overflow-hidden text-ellipsis">{svgInfo.width} × {svgInfo.height}</dd>

                    <dt className="text-default-500 text-right whitespace-nowrap">ViewBox</dt>
                    <dd className="font-mono whitespace-nowrap overflow-hidden text-ellipsis">{svgInfo.viewBox || "None"}</dd>

                    <dt className="text-default-500 text-right whitespace-nowrap">Elements</dt>
                    <dd className="whitespace-nowrap">{svgInfo.elementCount}</dd>

                    <dt className="text-default-500 text-right whitespace-nowrap">File Size</dt>
                    <dd className="whitespace-nowrap">{formatBytes(new Blob([svg]).size)}</dd>
                  </dl>
                  
                  {optStats && (
                    <div className="p-3 bg-success-50 rounded-lg border border-success-200">
                      <div className="text-sm font-medium text-success-800 mb-2">
                        Optimization Results
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-success-600">Before:</div>
                        <div>{formatBytes(optStats.before)}</div>
                        
                        <div className="text-success-600">After:</div>
                        <div>{formatBytes(optStats.after)}</div>
                        
                        <div className="text-success-600">Saved:</div>
                        <div className="font-medium">
                          {formatBytes(optStats.before - optStats.after)} 
                          ({Math.round((1 - optStats.after / optStats.before) * 100)}%)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-default-500 py-8">
                  <div className="text-2xl mb-2">📊</div>
                  <p>Load an SVG to see properties</p>
                </div>
              )}
            </div>
          </Tab>

          <Tab key="optimize" title="Optimize">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Switch
                  isSelected={optimizeOnLoad}
                  onValueChange={onOptimizeOnLoadChange}
                >
                  Auto-optimize on load
                </Switch>
              </div>
              
              <Divider />
              
              <Accordion variant="splitted">
                <AccordionItem key="svgo" title="SVGO Settings">
                  <div className="space-y-3">
                    {Object.entries(svgoFlags).map(([key, value]) => (
                      <Switch
                        key={key}
                        size="sm"
                        isSelected={value}
                        onValueChange={(checked) =>
                          onSvgoFlagsChange({ ...svgoFlags, [key]: checked })
                        }
                      >
                        {formatSvgoFlag(key)}
                      </Switch>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </Tab>

          <Tab key="export" title="Export">
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor={scalesId} className="text-sm font-medium mb-2 block">PNG Export Scales</label>
                <Input
                  id={scalesId}
                  size="sm"
                  value={scalesInput}
                  onChange={(e) => onScalesInputChange(e.target.value)}
                  placeholder="1,2,3"
                  description="Comma-separated scale factors"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {scalesInput.split(",").map((scale) => {
                    const scaleNum = parseFloat(scale.trim());
                    if (Number.isNaN(scaleNum)) return null;
                    return (
                      <Button
                        key={scale}
                        size="sm"
                        variant="flat"
                        onPress={() => onExportPng(scaleNum)}
                      >
                        {scaleNum}x PNG
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <Divider />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">React Component</span>
                  <Button size="sm" onPress={onCopyReactComponent}>
                    Copy
                  </Button>
                </div>
                <Snippet hideCopyButton className="w-full">
                  <pre className="text-xs whitespace-pre-wrap">{reactJSX}</pre>
                </Snippet>
              </div>
            </div>
          </Tab>
    </Tabs>
  );

  if (embedded) {
    return <div className="p-0">{content}</div>;
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <h3 className="text-lg font-semibold">Properties</h3>
      </CardHeader>
      <Divider />
      <CardBody className="p-0 overflow-auto">{content}</CardBody>
    </Card>
  );
}

function extractSvgInfo(svg: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "image/svg+xml");
    const svgElement = doc.querySelector("svg");
    
    if (!svgElement) return null;
    
    const width = svgElement.getAttribute("width") || "auto";
    const height = svgElement.getAttribute("height") || "auto";
    const viewBox = svgElement.getAttribute("viewBox");
    const elementCount = doc.querySelectorAll("*").length;
    
    return {
      width,
      height,
      viewBox,
      elementCount,
    };
  } catch {
    return null;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / (k ** i)).toFixed(1))} ${sizes[i]}`;
}

function formatSvgoFlag(flag: string): string {
  return flag
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

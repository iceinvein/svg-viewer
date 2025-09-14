import { Button } from "@heroui/button";
import { ButtonGroup } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Divider } from "@heroui/divider";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import {
  FiFolder,
  FiDownload,
  FiCopy,
  FiZap,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiGrid,
  FiEye,
  FiCode,
} from "react-icons/fi";

interface SvgToolbarProps {
  onFileLoad: () => void;
  onSample: () => void;
  onPaste: () => void;
  onOptimize: () => void;
  onDownload: () => void;
  onCopy: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomActual: () => void;
  onToggleGrid: () => void;
  onToggleBackground: () => void;
  onExportPng: (scale: number) => void;
  onCopyReactComponent: () => void;
  zoom: number;
  grid: boolean;
  bgTransparent: boolean;
}

export function SvgToolbar({
  onFileLoad,
  onSample,
  onPaste,
  onOptimize,
  onDownload,
  onCopy,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomActual,
  onToggleGrid,
  onToggleBackground,
  onExportPng,
  onCopyReactComponent,
  zoom,
  grid,
  bgTransparent,
}: SvgToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-content1 border-b border-divider">
      {/* File Operations */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content="Load SVG file">
          <Button onPress={onFileLoad} startContent={<FiFolder />}>
            Load
          </Button>
        </Tooltip>
        <Tooltip content="Load sample SVG">
          <Button onPress={onSample}>Sample</Button>
        </Tooltip>
        <Tooltip content="Paste from clipboard">
          <Button onPress={onPaste} startContent={<FiCopy />}>
            Paste
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" className="h-8" />

      {/* Optimization */}
      <Tooltip content="Optimize SVG with SVGO">
        <Button
          size="sm"
          variant="flat"
          color="primary"
          onPress={onOptimize}
          startContent={<FiZap />}
        >
          Optimize
        </Button>
      </Tooltip>

      <Divider orientation="vertical" className="h-8" />

      {/* View Controls */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content="Zoom in">
          <Button onPress={onZoomIn} isIconOnly>
            <FiZoomIn />
          </Button>
        </Tooltip>
        <Tooltip content="Zoom out">
          <Button onPress={onZoomOut} isIconOnly>
            <FiZoomOut />
          </Button>
        </Tooltip>
        <Tooltip content="Fit to view">
          <Button onPress={onZoomFit} isIconOnly>
            <FiMaximize2 />
          </Button>
        </Tooltip>
        <Tooltip content="Actual size (100%)">
          <Button onPress={onZoomActual} isIconOnly>
            1:1
          </Button>
        </Tooltip>
      </ButtonGroup>

      <div className="text-sm text-default-500 min-w-[60px]">{zoom}%</div>



      {/* Display Options */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content="Toggle grid">
          <Button
            onPress={onToggleGrid}
            isIconOnly
            color={grid ? "primary" : "default"}
            variant={grid ? "solid" : "flat"}
          >
            <FiGrid />
          </Button>
        </Tooltip>
        <Tooltip content="Toggle transparent background">
          <Button
            onPress={onToggleBackground}
            isIconOnly
            color={bgTransparent ? "primary" : "default"}
            variant={bgTransparent ? "solid" : "flat"}
          >
            <FiEye />
          </Button>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" className="h-8" />

      {/* Export Options */}
      <ButtonGroup size="sm" variant="flat">
        <Tooltip content="Download SVG">
          <Button onPress={onDownload} startContent={<FiDownload />}>
            SVG
          </Button>
        </Tooltip>
        <Dropdown>
          <DropdownTrigger>
            <Button size="sm" variant="flat">PNG</Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Export PNG" onAction={(key) => onExportPng(Number(key))}>
            <DropdownItem key="1">1x</DropdownItem>
            <DropdownItem key="2">2x</DropdownItem>
            <DropdownItem key="3">3x</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Tooltip content="Copy SVG code">
          <Button onPress={onCopy} startContent={<FiCopy />}>
            Copy
          </Button>
        </Tooltip>
        <Tooltip content="Copy React component">
          <Button onPress={onCopyReactComponent} startContent={<FiCode />}>
            React
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  );
}

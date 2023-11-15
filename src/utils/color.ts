import fs from "fs";
import { parse } from "yaml";

/**
 * Extract catppuccin's colorscheme color using string
 *
 * @param color - Name of color
 * @param colorType - Type of color output [hex, rgb, hsl] (optional)
 */
export function getColor(color: string, colorType: string = 'hex') {
  const colorFile = fs.readFileSync(`${process.cwd()}/src/configs/colors.yaml`, 'utf-8');
  const colorData = parse(colorFile);
  const colorHex = colorData[color][colorType];
  return colorHex;
}

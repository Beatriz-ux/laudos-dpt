declare module "jspdf-autotable" {
  import { jsPDF } from "jspdf";

  export interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: "auto" | "avoid" | "always";
    rowPageBreak?: "auto" | "avoid";
    tableWidth?: "auto" | "wrap" | number;
    showHead?: "everyPage" | "firstPage" | "never";
    showFoot?: "everyPage" | "lastPage" | "never";
    tableLineColor?: string | number[];
    tableLineWidth?: number;
    theme?: "striped" | "grid" | "plain";
    styles?: {
      font?: string;
      fontStyle?: string;
      overflow?: "linebreak" | "ellipsize" | "visible" | "hidden";
      fillColor?: string | number | number[];
      textColor?: string | number | number[];
      cellPadding?: number;
      fontSize?: number;
      cellWidth?: "auto" | "wrap" | number;
      minCellHeight?: number;
      minCellWidth?: number;
      halign?: "left" | "center" | "right";
      valign?: "top" | "middle" | "bottom";
      lineColor?: string | number | number[];
      lineWidth?: number;
    };
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: { [key: string]: any };
    didDrawPage?: (data: any) => void;
    didDrawCell?: (data: any) => void;
  }

  export default function autoTable(doc: jsPDF, options: UserOptions): jsPDF;
}

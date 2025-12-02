import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Report } from "@/types";
import { VEHICLE_SPECIES_LABELS, VEHICLE_TYPE_LABELS } from "@/types";

interface PDFGeneratorOptions {
  report: Report;
  expertName: string;
  expertBadge: string;
}

export async function generateReportPDF({ report, expertName, expertBadge }: PDFGeneratorOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.5;

    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
  };

  // ==================== HEADER ====================
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("GOVERNO DO ESTADO DA BAHIA", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  doc.text("SECRETARIA DA SEGURANÇA PÚBLICA", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  doc.text("DEPARTAMENTO DE POLÍCIA TÉCNICA", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  doc.text("DIRETORIA DO INTERIOR", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  doc.text("COORDENADORIA DE POLÍCIA TÉCNICA DE ILHÉUS", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Divider line
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // ==================== TITLE ====================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`LAUDO DE EXAME PERICIAL N° ${report.number}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // ==================== SECTION 1: REQUISITION INFORMATION ====================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. INFORMAÇÕES DA REQUISIÇÃO", margin, yPosition);
  yPosition += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const requisitionData = [
    ["Ofício:", report.oficio || "-"],
    ["Guia de Ofício:", report.guiaOficio || "-"],
    ["Data da Guia:", report.dataGuiaOficio ? new Date(report.dataGuiaOficio).toLocaleDateString("pt-BR") : "-"],
    ["Órgão Requisitante:", report.orgaoRequisitante || "-"],
    ["Autoridade Requisitante:", report.autoridadeRequisitante || "-"],
    ["Ocorrência Policial:", report.ocorrenciaPolicial || "-"],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: requisitionData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: contentWidth - 50 },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 5;

  if (report.objetivoPericia) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.text("Objetivo da Perícia:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    addWrappedText(report.objetivoPericia, 10);
    yPosition += 3;
  }

  if (report.preambulo) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.text("Preâmbulo:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    addWrappedText(report.preambulo, 10);
    yPosition += 5;
  }

  // ==================== SECTION 2: VEHICLE INFORMATION ====================
  checkPageBreak(20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. DADOS DO VEÍCULO", margin, yPosition);
  yPosition += 7;

  const vehicleData = [
    ["Placa:", report.vehicle?.plate || "-"],
    ["Placa Portada:", report.placaPortada || "-"],
    ["Espécie:", report.vehicleSpecies ? VEHICLE_SPECIES_LABELS[report.vehicleSpecies] : "-"],
    ["Tipo:", report.vehicleType ? VEHICLE_TYPE_LABELS[report.vehicleType] : "-"],
    ["Marca:", report.vehicle?.brand || "-"],
    ["Modelo:", report.vehicle?.model || "-"],
    ["Ano:", report.vehicle?.year?.toString() || "-"],
    ["Cor:", report.vehicle?.color || "-"],
    ["Categoria:", report.vehicle?.category || "-"],
    ["Chassi:", report.vehicle?.chassi || "-"],
    ["VIN:", report.vehicle?.vin || "-"],
    ["Motor:", report.vehicle?.motor || "-"],
    ["Série do Motor:", report.vehicle?.serieMotor || "-"],
    ["Licenciado para:", report.vehicle?.licensedTo || "-"],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: vehicleData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: contentWidth - 50 },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 5;

  if (report.vidro) {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.text("Vidro:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    addWrappedText(report.vidro, 10);
    yPosition += 3;
  }

  if (report.outrasNumeracoes) {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.text("Outras Numerações:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    addWrappedText(report.outrasNumeracoes, 10);
    yPosition += 3;
  }

  if (report.vehicle?.technicalCondition) {
    checkPageBreak(15);
    doc.setFont("helvetica", "bold");
    doc.text("Condição Técnica:", margin, yPosition);
    yPosition += 5;
    doc.setFont("helvetica", "normal");
    addWrappedText(report.vehicle.technicalCondition, 10);
    yPosition += 5;
  }

  // ==================== SECTION 3: TECHNICAL INFORMATION ====================
  if (report.glassInfo || report.plateInfo || report.motorInfo || report.centralEletronicaInfo || report.seriesAuxiliares) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("3. INFORMAÇÕES TÉCNICAS", margin, yPosition);
    yPosition += 7;

    if (report.glassInfo) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Informações dos Vidros:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.glassInfo, 10);
      yPosition += 3;
    }

    if (report.plateInfo) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text("Informações da Placa:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.plateInfo, 10);
      yPosition += 3;
    }

    if (report.motorInfo) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text("Informações do Motor:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.motorInfo, 10);
      yPosition += 3;
    }

    if (report.centralEletronicaInfo) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text("Informações da Central Eletrônica:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.centralEletronicaInfo, 10);
      yPosition += 3;
    }

    if (report.seriesAuxiliares) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text("Séries Auxiliares:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.seriesAuxiliares, 10);
      yPosition += 5;
    }
  }

  // ==================== SECTION 4: ORIGINAL VEHICLE DATA ====================
  if (report.vehicle?.isAdulterated && (report.originalPlate || report.originalBrand || report.originalModel)) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("4. DADOS DO VEÍCULO ORIGINAL", margin, yPosition);
    yPosition += 7;

    const originalData = [
      ["Placa Original:", report.originalPlate || "-"],
      ["Marca Original:", report.originalBrand || "-"],
      ["Modelo Original:", report.originalModel || "-"],
      ["Espécie Original:", report.originalSpecies ? VEHICLE_SPECIES_LABELS[report.originalSpecies] : "-"],
      ["Tipo Original:", report.originalType ? VEHICLE_TYPE_LABELS[report.originalType] : "-"],
      ["Cor Original:", report.originalColor || "-"],
      ["Chassi Original:", report.originalChassi || "-"],
      ["Motor Original:", report.originalMotor || "-"],
      ["Licenciado para:", report.originalLicensedTo || "-"],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: originalData,
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: contentWidth - 50 },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    if (report.originalAnalysisDetails) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text("Detalhes da Análise:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.originalAnalysisDetails, 10);
      yPosition += 5;
    }
  }

  // ==================== SECTION 5: PHOTOS ====================
  if (report.photos && report.photos.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("5. REGISTRO FOTOGRÁFICO", margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de ${report.photos.length} foto(s) anexada(s) ao laudo.`, margin, yPosition);
    yPosition += 10;

    // Add photos (max 2 per page for better quality)
    for (let i = 0; i < report.photos.length; i++) {
      const photo = report.photos[i];

      // Check if we need a new page
      if (i > 0 && i % 2 === 0) {
        doc.addPage();
        yPosition = margin;
      } else if (i > 0) {
        yPosition += 10;
      }

      checkPageBreak(100);

      try {
        // Add photo label
        doc.setFont("helvetica", "bold");
        doc.text(`Foto ${i + 1} - ${photo.category}${photo.subtype ? ` (${photo.subtype})` : ""}`, margin, yPosition);
        yPosition += 7;

        // Add photo
        const imgWidth = contentWidth;
        const imgHeight = 80; // Fixed height for consistency

        doc.addImage(photo.photoData, "JPEG", margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 5;

        if (photo.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          addWrappedText(`Descrição: ${photo.description}`, 9);
        }

      } catch (error) {
        console.error(`Error adding photo ${i + 1}:`, error);
        doc.setFont("helvetica", "italic");
        doc.text(`[Erro ao carregar foto ${i + 1}]`, margin, yPosition);
        yPosition += 10;
      }
    }

    yPosition += 5;
  }

  // ==================== SECTION 6: ANALYSIS AND CONCLUSION ====================
  if (report.analysis?.conclusion || report.analysis?.justification || report.analysis?.observations) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("6. ANÁLISE E CONCLUSÃO", margin, yPosition);
    yPosition += 10;

    if (report.analysis.conclusion) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("CONCLUSÃO:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.analysis.conclusion, 10);
      yPosition += 5;
    }

    if (report.analysis.isConclusive !== undefined) {
      doc.setFont("helvetica", "bold");
      doc.text(`Análise Conclusiva: ${report.analysis.isConclusive ? "SIM" : "NÃO"}`, margin, yPosition);
      yPosition += 7;
    }

    if (report.analysis.justification) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text("Justificativa:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.analysis.justification, 10);
      yPosition += 5;
    }

    if (report.analysis.observations) {
      checkPageBreak(15);
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      addWrappedText(report.analysis.observations, 10);
      yPosition += 10;
    }
  }

  // ==================== SIGNATURE ====================
  checkPageBreak(40);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const date = new Date(report.updatedAt);
  const dateStr = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.text(`Ilhéus-BA, ${dateStr}`, margin, yPosition);
  yPosition += 20;

  // Signature line
  doc.line(margin + 20, yPosition, pageWidth - margin - 20, yPosition);
  yPosition += 5;

  doc.setFont("helvetica", "bold");
  doc.text(expertName, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;

  doc.setFont("helvetica", "normal");
  doc.text(`Perito Criminal - Matrícula: ${expertBadge}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  doc.text("Departamento de Polícia Técnica", pageWidth / 2, yPosition, { align: "center" });

  // ==================== FOOTER ON ALL PAGES ====================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Laudo N° ${report.number} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(`Laudo_${report.number}.pdf`);
}

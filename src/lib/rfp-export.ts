// Export RFP content to .docx and .pdf
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageOrientation,
  LevelFormat,
} from 'docx';
import jsPDF from 'jspdf';

export interface RfpContent {
  executive_summary: string;
  background: string;
  objectives: string[];
  scope_of_work: {
    in_scope: string[];
    out_of_scope: string[];
    deliverables: string[];
  };
  requirements: {
    functional: string[];
    technical: string[];
    integrations: string[];
    security_compliance: string[];
    sla: string[];
  };
  cost: {
    pricing_model: string;
    budget_range: string;
    cost_breakdown: Array<{ line_item: string; description: string; estimated_cost: string }>;
    payment_terms: string;
  };
  timeline: {
    milestones: Array<{ name: string; target_date: string; description: string }>;
    submission_deadline: string;
    decision_date: string;
  };
  vendor_questions: Array<{ category: string; question: string }>;
  evaluation_criteria: Array<{ criterion: string; weight_pct: number; notes: string }>;
  submission_process: {
    response_format: string;
    contact: string;
    questions_deadline: string;
    additional_instructions: string;
  };
  assumptions_and_constraints: string[];
}

function p(text: string, opts: { bold?: boolean; size?: number } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22 })],
    spacing: { after: 120 },
  });
}

function h1(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 32 })],
    spacing: { before: 240, after: 160 },
  });
}

function h2(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 26 })],
    spacing: { before: 200, after: 120 },
  });
}

function bulletList(items: string[]) {
  return items.map(
    (t) =>
      new Paragraph({
        numbering: { reference: 'rfp-bullets', level: 0 },
        children: [new TextRun({ text: t, size: 22 })],
      }),
  );
}

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function tableCell(text: string, opts: { header?: boolean; width: number } = { width: 3120 }) {
  return new TableCell({
    borders: cellBorders,
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.header
      ? { fill: 'F0F0EA', type: ShadingType.CLEAR, color: 'auto' }
      : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: opts.header, size: 20 })],
      }),
    ],
  });
}

export async function exportRfpDocx(title: string, content: RfpContent): Promise<Blob> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 44 })],
      spacing: { after: 240 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Request for Proposal · ${new Date().toLocaleDateString()}`,
          italics: true,
          size: 22,
          color: '666666',
        }),
      ],
      spacing: { after: 360 },
    }),
  );

  children.push(h1('1. Executive summary'), p(content.executive_summary));
  children.push(h1('2. Background'), p(content.background));
  children.push(h1('3. Objectives'), ...bulletList(content.objectives));

  children.push(h1('4. Scope of work'));
  children.push(h2('In scope'), ...bulletList(content.scope_of_work.in_scope));
  children.push(h2('Out of scope'), ...bulletList(content.scope_of_work.out_of_scope));
  children.push(h2('Deliverables'), ...bulletList(content.scope_of_work.deliverables));

  children.push(h1('5. Requirements'));
  children.push(h2('Functional'), ...bulletList(content.requirements.functional));
  children.push(h2('Technical'), ...bulletList(content.requirements.technical));
  if (content.requirements.integrations?.length) {
    children.push(h2('Integrations'), ...bulletList(content.requirements.integrations));
  }
  children.push(h2('Security & compliance'), ...bulletList(content.requirements.security_compliance));
  children.push(h2('SLA'), ...bulletList(content.requirements.sla));

  children.push(h1('6. Cost'));
  children.push(p(`Pricing model: ${content.cost.pricing_model}`, { bold: true }));
  children.push(p(`Budget range: ${content.cost.budget_range}`));
  children.push(p(`Payment terms: ${content.cost.payment_terms}`));
  children.push(h2('Cost breakdown'));

  const costRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        tableCell('Line item', { header: true, width: 2400 }),
        tableCell('Description', { header: true, width: 5000 }),
        tableCell('Estimated cost', { header: true, width: 1960 }),
      ],
    }),
    ...content.cost.cost_breakdown.map(
      (row) =>
        new TableRow({
          children: [
            tableCell(row.line_item, { width: 2400 }),
            tableCell(row.description, { width: 5000 }),
            tableCell(row.estimated_cost, { width: 1960 }),
          ],
        }),
    ),
  ];

  const costTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 5000, 1960],
    rows: costRows,
  });

  children.push(h1('7. Timeline'));
  children.push(p(`Submission deadline: ${content.timeline.submission_deadline}`, { bold: true }));
  children.push(p(`Decision date: ${content.timeline.decision_date}`, { bold: true }));
  children.push(h2('Milestones'));
  content.timeline.milestones.forEach((m) => {
    children.push(p(`${m.name} — ${m.target_date}`, { bold: true }));
    children.push(p(m.description));
  });

  children.push(h1('8. Vendor questions'));
  const questionsByCategory = new Map<string, string[]>();
  content.vendor_questions.forEach((q) => {
    if (!questionsByCategory.has(q.category)) questionsByCategory.set(q.category, []);
    questionsByCategory.get(q.category)!.push(q.question);
  });
  questionsByCategory.forEach((qs, cat) => {
    children.push(h2(cat));
    children.push(...bulletList(qs));
  });

  children.push(h1('9. Evaluation criteria'));
  const evalRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        tableCell('Criterion', { header: true, width: 3120 }),
        tableCell('Weight', { header: true, width: 1560 }),
        tableCell('Notes', { header: true, width: 4680 }),
      ],
    }),
    ...content.evaluation_criteria.map(
      (c) =>
        new TableRow({
          children: [
            tableCell(c.criterion, { width: 3120 }),
            tableCell(`${c.weight_pct}%`, { width: 1560 }),
            tableCell(c.notes, { width: 4680 }),
          ],
        }),
    ),
  ];
  const evalTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 1560, 4680],
    rows: evalRows,
  });

  children.push(h1('10. Submission process'));
  children.push(p('Response format', { bold: true }), p(content.submission_process.response_format));
  children.push(p('Contact', { bold: true }), p(content.submission_process.contact));
  children.push(p('Questions deadline', { bold: true }), p(content.submission_process.questions_deadline));
  children.push(p('Additional instructions', { bold: true }), p(content.submission_process.additional_instructions));

  children.push(h1('11. Assumptions & constraints'));
  children.push(...bulletList(content.assumptions_and_constraints));

  // Stitch tables in by replacing a placeholder approach: use separate sections
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'rfp-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    styles: {
      default: { document: { run: { font: 'Helvetica', size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          ...children.slice(0, children.indexOf(children.find((c) => (c as any)?.options?.children?.[0]?.options?.text === 'Cost breakdown') ?? children[0]) + 1),
        ],
      },
    ],
  });

  // Simpler: just include everything plus tables in document order via a single section
  const finalDoc = new Document({
    numbering: {
      config: [
        {
          reference: 'rfp-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    styles: { default: { document: { run: { font: 'Helvetica', size: 22 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: assembleDocChildren(title, content, costTable, evalTable),
      },
    ],
  });

  // Suppress unused warning for the intermediate doc
  void doc;
  return Packer.toBlob(finalDoc);
}

function assembleDocChildren(
  title: string,
  content: RfpContent,
  costTable: Table,
  evalTable: Table,
) {
  const out: (Paragraph | Table)[] = [];

  out.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 44 })],
      spacing: { after: 240 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Request for Proposal · ${new Date().toLocaleDateString()}`,
          italics: true,
          size: 22,
          color: '666666',
        }),
      ],
      spacing: { after: 360 },
    }),
  );

  out.push(h1('1. Executive summary'), p(content.executive_summary));
  out.push(h1('2. Background'), p(content.background));
  out.push(h1('3. Objectives'), ...bulletList(content.objectives));

  out.push(h1('4. Scope of work'));
  out.push(h2('In scope'), ...bulletList(content.scope_of_work.in_scope));
  out.push(h2('Out of scope'), ...bulletList(content.scope_of_work.out_of_scope));
  out.push(h2('Deliverables'), ...bulletList(content.scope_of_work.deliverables));

  out.push(h1('5. Requirements'));
  out.push(h2('Functional'), ...bulletList(content.requirements.functional));
  out.push(h2('Technical'), ...bulletList(content.requirements.technical));
  if (content.requirements.integrations?.length) {
    out.push(h2('Integrations'), ...bulletList(content.requirements.integrations));
  }
  out.push(h2('Security & compliance'), ...bulletList(content.requirements.security_compliance));
  out.push(h2('SLA'), ...bulletList(content.requirements.sla));

  out.push(h1('6. Cost'));
  out.push(p(`Pricing model: ${content.cost.pricing_model}`, { bold: true }));
  out.push(p(`Budget range: ${content.cost.budget_range}`));
  out.push(p(`Payment terms: ${content.cost.payment_terms}`));
  out.push(h2('Cost breakdown'));
  out.push(costTable);

  out.push(h1('7. Timeline'));
  out.push(p(`Submission deadline: ${content.timeline.submission_deadline}`, { bold: true }));
  out.push(p(`Decision date: ${content.timeline.decision_date}`, { bold: true }));
  out.push(h2('Milestones'));
  content.timeline.milestones.forEach((m) => {
    out.push(p(`${m.name} — ${m.target_date}`, { bold: true }));
    out.push(p(m.description));
  });

  out.push(h1('8. Vendor questions'));
  const map = new Map<string, string[]>();
  content.vendor_questions.forEach((q) => {
    if (!map.has(q.category)) map.set(q.category, []);
    map.get(q.category)!.push(q.question);
  });
  map.forEach((qs, cat) => {
    out.push(h2(cat));
    out.push(...bulletList(qs));
  });

  out.push(h1('9. Evaluation criteria'));
  out.push(evalTable);

  out.push(h1('10. Submission process'));
  out.push(p('Response format', { bold: true }), p(content.submission_process.response_format));
  out.push(p('Contact', { bold: true }), p(content.submission_process.contact));
  out.push(p('Questions deadline', { bold: true }), p(content.submission_process.questions_deadline));
  out.push(p('Additional instructions', { bold: true }), p(content.submission_process.additional_instructions));

  out.push(h1('11. Assumptions & constraints'));
  out.push(...bulletList(content.assumptions_and_constraints));

  return out;
}

// PDF Export ---------------------------------------------------------------
// Branded, designed proposal template.

const BRAND = { r: 139, g: 92, b: 246 };       // primary purple
const BRAND_DARK = { r: 91, g: 33, b: 182 };   // deeper purple for accents
const INK = { r: 24, g: 22, b: 38 };           // body text
const MUTED = { r: 110, g: 105, b: 130 };      // secondary text
const HAIRLINE = { r: 224, g: 220, b: 235 };   // dividers
const ROW_TINT = { r: 247, g: 245, b: 251 };   // table alt row
const HEADER_BG = { r: 31, g: 23, b: 56 };     // dark header bar

export function exportRfpPdf(title: string, content: RfpContent): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 54;
  const marginTop = 72;
  const marginBottom = 64;
  const maxWidth = pageWidth - marginX * 2;
  let y = marginTop;
  let sectionCount = 0;

  const setFill = (c: { r: number; g: number; b: number }) => doc.setFillColor(c.r, c.g, c.b);
  const setText = (c: { r: number; g: number; b: number }) => doc.setTextColor(c.r, c.g, c.b);
  const setDraw = (c: { r: number; g: number; b: number }) => doc.setDrawColor(c.r, c.g, c.b);

  const drawPageChrome = () => {
    setFill(BRAND);
    doc.rect(0, 0, pageWidth, 4, 'F');
    setText(MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const footerY = pageHeight - 28;
    doc.text(title, marginX, footerY);
    doc.text('Proposal', pageWidth / 2, footerY, { align: 'center' });
    setText(INK);
  };

  const newPage = () => {
    doc.addPage();
    y = marginTop;
    drawPageChrome();
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginBottom) newPage();
  };

  const writeWrapped = (
    text: string,
    opts: { size?: number; bold?: boolean; spacing?: number; color?: { r: number; g: number; b: number }; italic?: boolean } = {},
  ) => {
    const size = opts.size ?? 10.5;
    doc.setFontSize(size);
    doc.setFont('helvetica', opts.italic ? 'italic' : opts.bold ? 'bold' : 'normal');
    setText(opts.color ?? INK);
    const lines = doc.splitTextToSize(text || '', maxWidth);
    const lineHeight = size * 1.45;
    lines.forEach((line: string) => {
      ensureSpace(lineHeight);
      doc.text(line, marginX, y);
      y += lineHeight;
    });
    y += opts.spacing ?? 6;
    setText(INK);
  };

  const heading1 = (label: string) => {
    sectionCount += 1;
    y += 14;
    ensureSpace(60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setText(BRAND);
    doc.text(String(sectionCount).padStart(2, '0'), marginX, y);
    setText(INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text(label, marginX + 22, y);
    y += 10;
    setDraw(BRAND);
    doc.setLineWidth(1.2);
    doc.line(marginX, y, marginX + 40, y);
    setDraw(HAIRLINE);
    doc.setLineWidth(0.5);
    doc.line(marginX + 40, y, pageWidth - marginX, y);
    y += 18;
  };

  const heading2 = (label: string) => {
    y += 6;
    ensureSpace(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setText(BRAND_DARK);
    doc.text(label.toUpperCase(), marginX, y);
    y += 14;
    setText(INK);
  };

  const bulletWrite = (items: string[]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    items.forEach((item) => {
      const indent = 16;
      const lines = doc.splitTextToSize(item, maxWidth - indent);
      const lineHeight = 14;
      lines.forEach((line: string, i: number) => {
        ensureSpace(lineHeight);
        if (i === 0) {
          setFill(BRAND);
          doc.circle(marginX + 3, y - 3.5, 1.8, 'F');
          setText(INK);
        }
        doc.text(line, marginX + indent, y);
        y += lineHeight;
      });
      y += 3;
    });
    y += 4;
  };

  const drawTable = (headers: string[], rows: string[][], widths: number[]) => {
    const colWidths = widths.map((w) => w * maxWidth);
    const padX = 8;
    const padY = 7;
    const headerH = 22;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const rowHeights = rows.map((r) => {
      let h = padY * 2;
      r.forEach((cell, i) => {
        const lines = doc.splitTextToSize(cell ?? '', colWidths[i] - padX * 2);
        h = Math.max(h, padY * 2 + lines.length * 12);
      });
      return Math.max(h, 22);
    });

    const renderHeader = () => {
      ensureSpace(headerH + 4);
      setFill(HEADER_BG);
      doc.rect(marginX, y, maxWidth, headerH, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      let x = marginX;
      headers.forEach((h, i) => {
        doc.text(h.toUpperCase(), x + padX, y + headerH / 2 + 3);
        x += colWidths[i];
      });
      setText(INK);
      y += headerH;
    };

    renderHeader();

    rows.forEach((row, ri) => {
      const h = rowHeights[ri];
      if (y + h > pageHeight - marginBottom) {
        newPage();
        renderHeader();
      }
      if (ri % 2 === 0) {
        setFill(ROW_TINT);
        doc.rect(marginX, y, maxWidth, h, 'F');
      }
      setDraw(HAIRLINE);
      doc.setLineWidth(0.3);
      doc.line(marginX, y + h, marginX + maxWidth, y + h);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      setText(INK);
      let x = marginX;
      row.forEach((cell, i) => {
        const lines = doc.splitTextToSize(cell ?? '', colWidths[i] - padX * 2);
        lines.forEach((line: string, li: number) => {
          doc.text(line, x + padX, y + padY + 9 + li * 12);
        });
        x += colWidths[i];
      });
      y += h;
    });
    y += 12;
  };

  const kvBlock = (label: string, value: string) => {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    setText(MUTED);
    doc.text(label.toUpperCase(), marginX, y);
    y += 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    setText(INK);
    const lines = doc.splitTextToSize(value || '—', maxWidth);
    lines.forEach((line: string) => {
      ensureSpace(14);
      doc.text(line, marginX, y);
      y += 14;
    });
    y += 8;
  };

  // -------------------- COVER PAGE --------------------
  setFill(BRAND);
  doc.rect(0, 0, pageWidth, 220, 'F');
  setFill(BRAND_DARK);
  doc.rect(0, 200, pageWidth, 20, 'F');
  setFill({ r: 167, g: 139, b: 250 });
  doc.triangle(pageWidth, 0, pageWidth, 180, pageWidth - 180, 0, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('PROPOSAL', marginX, 60, { charSpace: 4 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(230, 220, 255);
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    marginX,
    78,
  );

  setText(INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  const titleLines = doc.splitTextToSize(title, maxWidth);
  let titleY = 290;
  titleLines.forEach((line: string) => {
    doc.text(line, marginX, titleY);
    titleY += 38;
  });

  setDraw(BRAND);
  doc.setLineWidth(3);
  doc.line(marginX, titleY + 16, marginX + 60, titleY + 16);
  titleY += 36;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  setText(MUTED);
  doc.text('Prepared for the evaluation committee', marginX, titleY);
  titleY += 18;
  doc.text('A complete response to your requirements.', marginX, titleY);

  setFill({ r: 247, g: 245, b: 251 });
  doc.rect(0, pageHeight - 90, pageWidth, 90, 'F');
  setDraw(BRAND);
  doc.setLineWidth(2);
  doc.line(0, pageHeight - 90, pageWidth, pageHeight - 90);

  setText(INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CONFIDENTIAL', marginX, pageHeight - 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setText(MUTED);
  doc.text(
    'This proposal contains proprietary information. Not for redistribution without consent.',
    marginX,
    pageHeight - 42,
  );

  // -------------------- BODY --------------------
  newPage();

  heading1('Executive summary');
  writeWrapped(content.executive_summary);

  heading1('Background');
  writeWrapped(content.background);

  heading1('Objectives');
  bulletWrite(content.objectives);

  heading1('Scope of work');
  heading2('In scope');
  bulletWrite(content.scope_of_work.in_scope);
  heading2('Out of scope');
  bulletWrite(content.scope_of_work.out_of_scope);
  heading2('Deliverables');
  bulletWrite(content.scope_of_work.deliverables);

  heading1('Requirements');
  heading2('Functional');
  bulletWrite(content.requirements.functional);
  heading2('Technical');
  bulletWrite(content.requirements.technical);
  if (content.requirements.integrations?.length) {
    heading2('Integrations');
    bulletWrite(content.requirements.integrations);
  }
  heading2('Security & compliance');
  bulletWrite(content.requirements.security_compliance);
  heading2('SLA');
  bulletWrite(content.requirements.sla);

  heading1('Investment');
  kvBlock('Pricing model', content.cost.pricing_model);
  kvBlock('Budget range', content.cost.budget_range);
  kvBlock('Payment terms', content.cost.payment_terms);
  heading2('Cost breakdown');
  drawTable(
    ['Line item', 'Description', 'Estimated cost'],
    content.cost.cost_breakdown.map((c) => [c.line_item, c.description, c.estimated_cost]),
    [0.26, 0.54, 0.2],
  );

  heading1('Timeline');
  kvBlock('Submission deadline', content.timeline.submission_deadline);
  kvBlock('Decision date', content.timeline.decision_date);
  heading2('Milestones');
  drawTable(
    ['Milestone', 'Target', 'Detail'],
    content.timeline.milestones.map((m) => [m.name, m.target_date, m.description]),
    [0.26, 0.18, 0.56],
  );

  heading1('Vendor questions');
  const grouped = new Map<string, string[]>();
  content.vendor_questions.forEach((q) => {
    if (!grouped.has(q.category)) grouped.set(q.category, []);
    grouped.get(q.category)!.push(q.question);
  });
  grouped.forEach((qs, cat) => {
    heading2(cat);
    bulletWrite(qs);
  });

  heading1('Evaluation criteria');
  drawTable(
    ['Criterion', 'Weight', 'Notes'],
    content.evaluation_criteria.map((c) => [c.criterion, `${c.weight_pct}%`, c.notes]),
    [0.3, 0.12, 0.58],
  );

  heading1('Submission process');
  kvBlock('Response format', content.submission_process.response_format);
  kvBlock('Contact', content.submission_process.contact);
  kvBlock('Questions deadline', content.submission_process.questions_deadline);
  kvBlock('Additional instructions', content.submission_process.additional_instructions);

  heading1('Assumptions & constraints');
  bulletWrite(content.assumptions_and_constraints);

  // -------------------- PAGE NUMBERS --------------------
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(MUTED);
    doc.text(`${i - 1} / ${total - 1}`, pageWidth - marginX, pageHeight - 28, { align: 'right' });
  }

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

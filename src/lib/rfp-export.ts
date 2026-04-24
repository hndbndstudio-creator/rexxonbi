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

export function exportRfpPdf(title: string, content: RfpContent): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 54;
  const marginY = 54;
  const maxWidth = pageWidth - marginX * 2;
  let y = marginY;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - marginY) {
      doc.addPage();
      y = marginY;
    }
  };

  const writeWrapped = (text: string, opts: { size?: number; bold?: boolean; spacing?: number } = {}) => {
    const size = opts.size ?? 11;
    doc.setFontSize(size);
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text || '', maxWidth);
    const lineHeight = size * 1.3;
    lines.forEach((line: string) => {
      ensureSpace(lineHeight);
      doc.text(line, marginX, y);
      y += lineHeight;
    });
    y += opts.spacing ?? 4;
  };

  const heading1 = (text: string) => {
    y += 8;
    ensureSpace(28);
    writeWrapped(text, { size: 18, bold: true, spacing: 6 });
  };
  const heading2 = (text: string) => {
    y += 4;
    ensureSpace(22);
    writeWrapped(text, { size: 13, bold: true, spacing: 4 });
  };

  const bulletWrite = (items: string[]) => {
    items.forEach((item) => {
      const lines = doc.splitTextToSize(item, maxWidth - 18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      lines.forEach((line: string, i: number) => {
        ensureSpace(14);
        const prefix = i === 0 ? '•  ' : '   ';
        doc.text(prefix + line, marginX, y);
        y += 14;
      });
      y += 2;
    });
    y += 4;
  };

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(title, maxWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, y, { align: 'center' });
    y += 26;
  });
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Request for Proposal · ${new Date().toLocaleDateString()}`, pageWidth / 2, y, {
    align: 'center',
  });
  doc.setTextColor(0);
  y += 28;

  heading1('1. Executive summary');
  writeWrapped(content.executive_summary);

  heading1('2. Background');
  writeWrapped(content.background);

  heading1('3. Objectives');
  bulletWrite(content.objectives);

  heading1('4. Scope of work');
  heading2('In scope');
  bulletWrite(content.scope_of_work.in_scope);
  heading2('Out of scope');
  bulletWrite(content.scope_of_work.out_of_scope);
  heading2('Deliverables');
  bulletWrite(content.scope_of_work.deliverables);

  heading1('5. Requirements');
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

  heading1('6. Cost');
  writeWrapped(`Pricing model: ${content.cost.pricing_model}`, { bold: true });
  writeWrapped(`Budget range: ${content.cost.budget_range}`);
  writeWrapped(`Payment terms: ${content.cost.payment_terms}`);
  heading2('Cost breakdown');
  content.cost.cost_breakdown.forEach((row) => {
    writeWrapped(`${row.line_item} — ${row.estimated_cost}`, { bold: true });
    writeWrapped(row.description);
  });

  heading1('7. Timeline');
  writeWrapped(`Submission deadline: ${content.timeline.submission_deadline}`, { bold: true });
  writeWrapped(`Decision date: ${content.timeline.decision_date}`, { bold: true });
  heading2('Milestones');
  content.timeline.milestones.forEach((m) => {
    writeWrapped(`${m.name} — ${m.target_date}`, { bold: true });
    writeWrapped(m.description);
  });

  heading1('8. Vendor questions');
  const map = new Map<string, string[]>();
  content.vendor_questions.forEach((q) => {
    if (!map.has(q.category)) map.set(q.category, []);
    map.get(q.category)!.push(q.question);
  });
  map.forEach((qs, cat) => {
    heading2(cat);
    bulletWrite(qs);
  });

  heading1('9. Evaluation criteria');
  content.evaluation_criteria.forEach((c) => {
    writeWrapped(`${c.criterion} — ${c.weight_pct}%`, { bold: true });
    writeWrapped(c.notes);
  });

  heading1('10. Submission process');
  writeWrapped('Response format', { bold: true });
  writeWrapped(content.submission_process.response_format);
  writeWrapped('Contact', { bold: true });
  writeWrapped(content.submission_process.contact);
  writeWrapped('Questions deadline', { bold: true });
  writeWrapped(content.submission_process.questions_deadline);
  writeWrapped('Additional instructions', { bold: true });
  writeWrapped(content.submission_process.additional_instructions);

  heading1('11. Assumptions & constraints');
  bulletWrite(content.assumptions_and_constraints);

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

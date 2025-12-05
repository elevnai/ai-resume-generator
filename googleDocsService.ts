
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import saveAs from 'file-saver';

const createResumeDocument = (resumeText: string): Document => {
  // --- Formatting Constants ---
  const FONT_FAMILY = "Arial";
  
  // Section Headings (Expanded for robustness)
  const SECTION_HEADINGS = [
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'EXECUTIVE SUMMARY',
    'CORE SKILLS', 'SKILLS', 'SKILLS & EXPERTISE', 'AREAS OF EXPERTISE',
    'PROFESSIONAL EXPERIENCE', 'EXPERIENCE', 'WORK HISTORY', 'EMPLOYMENT HISTORY',
    'SECURITY/PROJECTS', 'PROJECTS', 'RELEVANT PROJECTS', 'TECHNICAL PROJECTS',
    'CERTIFICATIONS', 'CERTIFICATIONS & TRAINING', 'EDUCATION & CERTIFICATIONS',
    'TOOLS & PLATFORMS', 'TOOLS', 'TOOLS & TECHNOLOGIES', 'TECHNICAL SKILLS',
    'EDUCATION'
  ];

  // Specific companies to bold in experience sections
  const COMPANIES = ['Citadel Drilling', 'DuPure', 'Houston Water Solutions'];

  const lines = resumeText.split('\n');
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, but allow paragraph spacing to handle gaps naturally
    if (!line) continue;

    // 1. Name Detection (Large, Bold, Centered)
    if (line.toLowerCase().includes('nicholas richardson')) {
       paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line.toUpperCase(), bold: true, size: 36, font: FONT_FAMILY })], // 18pt
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 }, // 6pt after
      }));
      continue;
    }

    // 2. Contact Info Detection (Standard size, Centered, Separator Line)
    // Detects lines with email or phone number patterns
    if (line.includes('@') || (line.match(/\d/) && (line.includes('phone') || line.includes('832')))) {
       paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, size: 20, font: FONT_FAMILY })], // 10pt
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }, // 15pt after to separate from content
        border: {
            bottom: {
                color: "CCCCCC",
                space: 4,
                style: BorderStyle.SINGLE,
                size: 6,
            },
        },
      }));
      continue;
    }

    // 3. Section Headings Detection (Bold, Larger, Bottom Border)
    const cleanLine = line.toUpperCase().replace(/[:\-–]$/, '').trim();
    const isHeading = SECTION_HEADINGS.some(h => cleanLine === h || cleanLine.startsWith(h + ' '));
    
    if (isHeading) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: cleanLine, bold: true, size: 28, font: FONT_FAMILY })], // 14pt
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 120 }, // 18pt before, 6pt after
        border: {
            bottom: {
                color: "444444",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 4,
            },
        },
      }));
      continue;
    }

    // 4. Job Titles / Company Headers (Bold, Standard Size)
    const isCompany = COMPANIES.some(c => line.includes(c));
    // Also detect lines that typically format as "Role | Company | Date"
    const isRoleLine = line.includes('|') && !line.includes('@') && line.length < 100;

    if (isCompany || isRoleLine) {
       paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, bold: true, size: 22, font: FONT_FAMILY })], // 11pt Bold
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 60 }, // 12pt before, 3pt after
      }));
      continue;
    }

    // 5. Bullet Points (Indented)
    const bulletMatch = line.match(/^([•\-*●])\s+(.*)/) || line.match(/^([•\-*●])(.*)/);
    if (bulletMatch) {
      const text = bulletMatch[2].trim();
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: text, size: 22, font: FONT_FAMILY })], // 11pt
        bullet: { level: 0 }, // Triggers native list formatting
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 }, // 6pt after
      }));
      continue;
    }

    // 6. Standard Body Text
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: line, size: 22, font: FONT_FAMILY })], // 11pt
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 }, // 6pt after
    }));
  }

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_FAMILY,
            size: 22, // 11pt default
            color: "000000",
          },
          paragraph: {
             spacing: { line: 276 }, // ~1.2 line spacing for readability
          }
        },
      },
    },
    sections: [{ 
        properties: {
            page: {
                margin: {
                    top: 720, // 0.5 inch
                    right: 720,
                    bottom: 720,
                    left: 720,
                }
            }
        },
        children: paragraphs 
    }]
  });
};

// Generates a Blob for use in Native Sharing or Client-side operations
export const generateDocxBlob = async (resumeText: string): Promise<Blob> => {
    const doc = createResumeDocument(resumeText);
    return await Packer.toBlob(doc);
};

// Trigger a standard browser download
export const exportResumeAsDocx = async (resumeText: string, filename: string = "Nicholas_Richardson_Resume.docx") => {
  const blob = await generateDocxBlob(resumeText);
  const finalFilename = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  saveAs(blob, finalFilename);
};

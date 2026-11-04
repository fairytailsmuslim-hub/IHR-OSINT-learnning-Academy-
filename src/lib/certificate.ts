import { jsPDF } from 'jspdf';

export interface CertificatePayload {
  certificateId: string;
  studentName: string;
  stage: 'A' | 'B';
  certificateTitle: string;
  examScore: number;
  issuedDateIso: string;
  outcomes: string[];
}

export function generateVerificationCode(uid: string, stage: 'A' | 'B', score: number): string {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || 'IHROSINT';
  const year = new Date().getUTCFullYear();
  const checksum = ((score * 31 + clean.length * 17 + (stage === 'A' ? 101 : 211)) % 9999)
    .toString()
    .padStart(4, '0');
  return `IHR-STG${stage}-${year}-${clean}-${checksum}`;
}

export function downloadCertificatePdf(payload: CertificatePayload): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Deep slate academic background
  doc.setFillColor(11, 17, 30);
  doc.rect(0, 0, width, height, 'F');

  // Double hairline architectural border
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(1.5);
  doc.rect(28, 28, width - 56, height - 56);

  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.75);
  doc.rect(36, 36, width - 72, height - 72);

  // Header institution title
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IHR OSINT — OPEN SOURCE INTELLIGENCE ACADEMY', width / 2, 82, {
    align: 'center',
  });

  // Stage classification line
  doc.setTextColor(56, 189, 248);
  doc.setFontSize(10);
  const stageLine =
    payload.stage === 'A'
      ? 'STAGE A CREDENTIAL · ZERO-TOUCH PASSIVE RECONNAISSANCE & VERIFICATION'
      : 'STAGE B CREDENTIAL · CYBER THREAT INTELLIGENCE, SOC & STRUCTURED ANALYSIS';
  doc.text(stageLine, width / 2, 102, { align: 'center' });

  // Main Certificate Title
  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(payload.certificateTitle, width / 2, 152, { align: 'center' });

  // Conferred upon
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('This certifies that', width / 2, 192, { align: 'center' });

  // Recipient Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(payload.studentName || 'Verified OSINT Scholar', width / 2, 228, {
    align: 'center',
  });

  // Divider line under name
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(1);
  doc.line(width / 2 - 180, 240, width / 2 + 180, 240);

  // Description paragraph
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  const bodyCopy =
    payload.stage === 'A'
      ? `has demonstrated rigorous practical proficiency across 5 Phases and 20 Modules of Passive Open Source Intelligence, passing the Stage A Capstone Investigation & Final Examination with a score of ${payload.examScore}% while adhering strictly to legal, ethical, and zero-touch OPSEC standards.`
      : `building upon the Stage A Passive OSINT Certificate, has mastered Phases 6–8 (Modules 21–30) covering Cyber Threat Intelligence, MITRE ATT&CK Reconnaissance mapping, SOC Alert Enrichment, Corporate Due Diligence, and Admiralty-graded analytic reporting with a Final Examination score of ${payload.examScore}%.`;
  const splitDesc = doc.splitTextToSize(bodyCopy, width - 190);
  doc.text(splitDesc, width / 2, 268, { align: 'center' });

  // Verified Competencies Box
  doc.setFillColor(17, 25, 39);
  doc.setDrawColor(30, 41, 59);
  doc.rect(85, 322, width - 170, 138, 'FD');

  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('VERIFIED COMPETENCIES', 105, 342);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  payload.outcomes.slice(0, 6).forEach((outcome, index) => {
    const col = index < 3 ? 105 : width / 2 + 10;
    const rowY = 364 + (index % 3) * 28;
    const wrapped = doc.splitTextToSize(`• ${outcome}`, width / 2 - 115);
    doc.text(wrapped, col, rowY);
  });

  // Footer Metadata & Verification ID
  doc.setTextColor(148, 163, 184);
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.text(`Credential ID: ${payload.certificateId}`, 85, height - 72);
  doc.text(`Issued (UTC):  ${payload.issuedDateIso.slice(0, 10)}`, 85, height - 56);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(241, 245, 249);
  doc.text('IHR OSINT Academic Board', width - 85, height - 72, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9.5);
  doc.text('Open Source Intelligence & Threat Analysis Curriculum', width - 85, height - 56, {
    align: 'right',
  });

  const safeSlug = payload.stage === 'A' ? 'Passive-OSINT-Certificate' : 'Advanced-OSINT-CTI-Certificate';
  doc.save(`IHR-OSINT-${safeSlug}-${payload.certificateId}.pdf`);
}

// frontend/src/utils/exportReports.ts
// ✅ UTILITY - Generate PDF and CSV reports from analytics data

import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface AnalyticsData {
  stats: {
    overview: {
      totalQuestions: number;
      totalCorrect: number;
      overallAccuracy: string;
      totalSessions: number;
      totalStudyTime: number;
      averageSessionScore: string;
      easyCorrect: number;
      easyTotal: number;
      mediumCorrect: number;
      mediumTotal: number;
      hardCorrect: number;
      hardTotal: number;
    };
    subjectBreakdown: Array<{
      name: string;
      totalQuestions: number;
      correct: number;
      accuracy: number;
    }>;
    recentSessions: Array<{
      id: string;
      date: Date;
      score: number;
      questions: number;
      correct: number;
    }>;
  };
}

/**
 * Generate PDF report from analytics data
 */
export const generatePDFReport = (data: AnalyticsData, userName: string = 'Student') => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 15;

  // Header
  pdf.setFillColor(79, 70, 229); // Indigo
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('AceWAEC Pro - Analytics Report', pageWidth / 2, 15, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text(`Generated on ${format(new Date(), 'PPpp')}`, pageWidth / 2, 23, { align: 'center' });

  yPosition = 40;

  // Student Info
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text(`Student: ${userName}`, 15, yPosition);
  yPosition += 8;

  // Overview Section
  pdf.setFontSize(14);
  pdf.setTextColor(79, 70, 229);
  pdf.text('Performance Overview', 15, yPosition);
  yPosition += 8;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);

  const overviewData = [
    [`Overall Accuracy: ${data.stats.overview.overallAccuracy}%`, `Total Sessions: ${data.stats.overview.totalSessions}`],
    [`Total Questions: ${data.stats.overview.totalQuestions}`, `Study Time: ${data.stats.overview.totalStudyTime} mins`],
    [`Correct Answers: ${data.stats.overview.totalCorrect}`, `Avg Score: ${data.stats.overview.averageSessionScore}%`],
  ];

  overviewData.forEach((row) => {
    pdf.text(row[0], 15, yPosition);
    pdf.text(row[1], pageWidth / 2, yPosition);
    yPosition += 7;
  });

  yPosition += 3;

  // Difficulty Breakdown
  pdf.setFontSize(14);
  pdf.setTextColor(79, 70, 229);
  pdf.text('Difficulty Breakdown', 15, yPosition);
  yPosition += 8;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);

  const difficultyData = [
    `Easy: ${data.stats.overview.easyCorrect}/${data.stats.overview.easyTotal} (${((data.stats.overview.easyCorrect / data.stats.overview.easyTotal) * 100).toFixed(1)}%)`,
    `Medium: ${data.stats.overview.mediumCorrect}/${data.stats.overview.mediumTotal} (${((data.stats.overview.mediumCorrect / data.stats.overview.mediumTotal) * 100).toFixed(1)}%)`,
    `Hard: ${data.stats.overview.hardCorrect}/${data.stats.overview.hardTotal} (${((data.stats.overview.hardCorrect / data.stats.overview.hardTotal) * 100).toFixed(1)}%)`,
  ];

  difficultyData.forEach((text) => {
    pdf.text(text, 15, yPosition);
    yPosition += 6;
  });

  // Subject Performance Table
  yPosition += 5;
  pdf.setFontSize(14);
  pdf.setTextColor(79, 70, 229);
  pdf.text('Subject Performance', 15, yPosition);
  yPosition += 10;

  // Table Headers
  pdf.setFillColor(230, 230, 250);
  pdf.rect(15, yPosition - 5, pageWidth - 30, 7, 'F');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.text('Subject', 18, yPosition);
  pdf.text('Questions', 70, yPosition);
  pdf.text('Correct', 100, yPosition);
  pdf.text('Accuracy', 130, yPosition);

  yPosition += 7;

  // Table Rows
  data.stats.subjectBreakdown.forEach((subject) => {
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 15;
    }

    pdf.text(subject.name, 18, yPosition);
    pdf.text(subject.totalQuestions.toString(), 70, yPosition);
    pdf.text(subject.correct.toString(), 100, yPosition);
    pdf.text(`${subject.accuracy.toFixed(1)}%`, 130, yPosition);
    yPosition += 7;
  });

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text('© 2024 AceWAEC Pro. Confidential.', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save PDF
  pdf.save(`AceWAEC-Report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

/**
 * Generate CSV report from analytics data
 */
export const generateCSVReport = (data: AnalyticsData, userName: string = 'Student') => {
  let csv = `AceWAEC Pro - Analytics Report\n`;
  csv += `Generated on: ${format(new Date(), 'PPpp')}\n`;
  csv += `Student: ${userName}\n\n`;

  // Overview Section
  csv += `Performance Overview\n`;
  csv += `Overall Accuracy (%),${data.stats.overview.overallAccuracy}\n`;
  csv += `Total Sessions,${data.stats.overview.totalSessions}\n`;
  csv += `Total Questions,${data.stats.overview.totalQuestions}\n`;
  csv += `Correct Answers,${data.stats.overview.totalCorrect}\n`;
  csv += `Study Time (minutes),${data.stats.overview.totalStudyTime}\n`;
  csv += `Average Session Score (%),${data.stats.overview.averageSessionScore}\n\n`;

  // Difficulty Breakdown
  csv += `Difficulty Breakdown\n`;
  csv += `Easy Correct,${data.stats.overview.easyCorrect}\n`;
  csv += `Easy Total,${data.stats.overview.easyTotal}\n`;
  csv += `Easy Accuracy (%),${((data.stats.overview.easyCorrect / data.stats.overview.easyTotal) * 100).toFixed(2)}\n`;
  csv += `Medium Correct,${data.stats.overview.mediumCorrect}\n`;
  csv += `Medium Total,${data.stats.overview.mediumTotal}\n`;
  csv += `Medium Accuracy (%),${((data.stats.overview.mediumCorrect / data.stats.overview.mediumTotal) * 100).toFixed(2)}\n`;
  csv += `Hard Correct,${data.stats.overview.hardCorrect}\n`;
  csv += `Hard Total,${data.stats.overview.hardTotal}\n`;
  csv += `Hard Accuracy (%),${((data.stats.overview.hardCorrect / data.stats.overview.hardTotal) * 100).toFixed(2)}\n\n`;

  // Subject Performance
  csv += `Subject Performance\n`;
  csv += `Subject,Total Questions,Correct Answers,Accuracy (%)\n`;
  data.stats.subjectBreakdown.forEach((subject) => {
    csv += `${subject.name},${subject.totalQuestions},${subject.correct},${subject.accuracy.toFixed(2)}\n`;
  });

  csv += `\n`;

  // Recent Sessions
  csv += `Recent Sessions\n`;
  csv += `Date,Score (%),Questions,Correct,Accuracy (%)\n`;
  data.stats.recentSessions.forEach((session) => {
    const accuracy = ((session.correct / session.questions) * 100).toFixed(2);
    csv += `${format(new Date(session.date), 'yyyy-MM-dd HH:mm')},${session.score.toFixed(2)},${session.questions},${session.correct},${accuracy}\n`;
  });

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AceWAEC-Report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Generate JSON export for data backup
 */
export const generateJSONReport = (data: AnalyticsData, userName: string = 'Student') => {
  const report = {
    metadata: {
      generatedAt: new Date().toISOString(),
      studentName: userName,
      version: '1.0',
    },
    data,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AceWAEC-Report-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Generate summary statistics
 */
export const generateSummaryStats = (data: AnalyticsData) => {
  return {
    overallAccuracy: parseFloat(data.stats.overview.overallAccuracy),
    totalSessions: data.stats.overview.totalSessions,
    totalQuestions: data.stats.overview.totalQuestions,
    successRate: ((data.stats.overview.totalCorrect / data.stats.overview.totalQuestions) * 100).toFixed(2),
    averageSessionScore: parseFloat(data.stats.overview.averageSessionScore),
    totalStudyTime: data.stats.overview.totalStudyTime,
    easyAccuracy: ((data.stats.overview.easyCorrect / data.stats.overview.easyTotal) * 100).toFixed(2),
    mediumAccuracy: ((data.stats.overview.mediumCorrect / data.stats.overview.mediumTotal) * 100).toFixed(2),
    hardAccuracy: ((data.stats.overview.hardCorrect / data.stats.overview.hardTotal) * 100).toFixed(2),
    topSubject: data.stats.subjectBreakdown.reduce((max, s) => (s.accuracy > max.accuracy ? s : max)),
    weakestSubject: data.stats.subjectBreakdown.reduce((min, s) => (s.accuracy < min.accuracy ? s : min)),
  };
};
// frontend/src/utils/exportUtils.ts
// ✅ FULLY FIXED - Removed ALL 'any' type usage with proper interfaces

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ✅ FIXED: Define proper AutoTable options interface instead of 'any'
interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: {
    fillColor?: number[];
    textColor?: number;
  };
  alternateRowStyles?: {
    fillColor?: number[];
  };
  margin?: {
    left?: number;
    right?: number;
  };
}

// ✅ FIXED: Define proper jsPDF extension interface instead of 'any'
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: AutoTableOptions) => jsPDFWithAutoTable;
  lastAutoTable: {
    finalY: number;
  };
}

// ✅ FIXED: Extend jsPDF module with proper typing
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface DashboardData {
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
      date: Date | string;
      score: number;
      questions: number;
      correct: number;
    }>;
  };
  streak?: number;
  peerComparison?: {
    averageAccuracy: number;
    yourAccuracy: number;
    percentile: number;
  };
  studyGoals?: Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: string;
    status: 'on_track' | 'at_risk' | 'completed';
  }>;
}

/**
 * Export dashboard data as PDF
 * ✅ FIXED: Uses properly typed jsPDFWithAutoTable
 */
export const exportToPDF = (data: DashboardData, studentName: string = 'Student') => {
  const pdf = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 15;

  // Header
  pdf.setFontSize(18);
  pdf.text('AceWAEC Pro - Analytics Report', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Student: ${studentName}`, pageWidth / 2, yPosition, { align: 'center' });
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition + 5, { align: 'center' });

  yPosition += 15;
  pdf.setTextColor(0);

  // Overview Section
  pdf.setFontSize(14);
  pdf.text('Performance Overview', 15, yPosition);

  yPosition += 8;
  pdf.setFontSize(10);

  const overviewData = [
    ['Metric', 'Value'],
    ['Overall Accuracy', `${data.stats.overview.overallAccuracy}%`],
    ['Total Questions', data.stats.overview.totalQuestions.toString()],
    ['Correct Answers', data.stats.overview.totalCorrect.toString()],
    ['Practice Sessions', data.stats.overview.totalSessions.toString()],
    ['Study Time', `${data.stats.overview.totalStudyTime} minutes`],
    ['Average Session Score', `${data.stats.overview.averageSessionScore}%`]
  ];

  if (data.streak) {
    overviewData.push(['Learning Streak', `${data.streak} days`]);
  }

  // ✅ FIXED: No 'as any' needed - properly typed as jsPDFWithAutoTable
  pdf.autoTable({
    startY: yPosition,
    head: [overviewData[0]],
    body: overviewData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 }
  });

  yPosition = pdf.lastAutoTable.finalY + 10;

  // Difficulty Breakdown
  pdf.setFontSize(14);
  pdf.text('Difficulty Performance', 15, yPosition);

  yPosition += 8;

  const difficultyData = [
    ['Difficulty', 'Correct', 'Total', 'Accuracy'],
    [
      'Easy',
      data.stats.overview.easyCorrect.toString(),
      data.stats.overview.easyTotal.toString(),
      `${Math.round((data.stats.overview.easyCorrect / data.stats.overview.easyTotal) * 100) || 0}%`
    ],
    [
      'Medium',
      data.stats.overview.mediumCorrect.toString(),
      data.stats.overview.mediumTotal.toString(),
      `${Math.round((data.stats.overview.mediumCorrect / data.stats.overview.mediumTotal) * 100) || 0}%`
    ],
    [
      'Hard',
      data.stats.overview.hardCorrect.toString(),
      data.stats.overview.hardTotal.toString(),
      `${Math.round((data.stats.overview.hardCorrect / data.stats.overview.hardTotal) * 100) || 0}%`
    ]
  ];

  // ✅ FIXED: No 'as any' needed - properly typed
  pdf.autoTable({
    startY: yPosition,
    head: [difficultyData[0]],
    body: difficultyData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 15, right: 15 }
  });

  yPosition = pdf.lastAutoTable.finalY + 10;

  // Subject Breakdown
  if (data.stats.subjectBreakdown.length > 0) {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 15;
    }

    pdf.setFontSize(14);
    pdf.text('Performance by Subject', 15, yPosition);

    yPosition += 8;

    const subjectData = [
      ['Subject', 'Correct', 'Total', 'Accuracy'],
      ...data.stats.subjectBreakdown.map(s => [
        s.name,
        s.correct.toString(),
        s.totalQuestions.toString(),
        `${Math.round(s.accuracy)}%`
      ])
    ];

    // ✅ FIXED: No 'as any' needed - properly typed
    pdf.autoTable({
      startY: yPosition,
      head: [subjectData[0]],
      body: subjectData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 }
    });

    yPosition = pdf.lastAutoTable.finalY + 10;
  }

  // Peer Comparison
  if (data.peerComparison) {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 15;
    }

    pdf.setFontSize(14);
    pdf.text('Peer Comparison', 15, yPosition);

    yPosition += 8;

    const comparisonData = [
      ['Metric', 'Your Score', 'Class Average'],
      [`Accuracy`, `${data.peerComparison.yourAccuracy}%`, `${data.peerComparison.averageAccuracy}%`],
      [`Percentile Rank`, `Top ${100 - data.peerComparison.percentile}%`, '-']
    ];

    // ✅ FIXED: No 'as any' needed - properly typed
    pdf.autoTable({
      startY: yPosition,
      head: [comparisonData[0]],
      body: comparisonData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 }
    });
  }

  // Save PDF
  pdf.save(`AceWAEC_Report_${studentName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export dashboard data as CSV
 */
export const exportToCSV = (data: DashboardData, studentName: string = 'Student') => {
  const headers = [
    'Analytics Report - AceWAEC Pro',
    `Student: ${studentName}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    ''
  ];

  let csvContent = headers.map(h => h).join('\n') + '\n\n';

  // Overview
  csvContent += 'PERFORMANCE OVERVIEW\n';
  csvContent += 'Metric,Value\n';
  csvContent += `Overall Accuracy,${data.stats.overview.overallAccuracy}%\n`;
  csvContent += `Total Questions,${data.stats.overview.totalQuestions}\n`;
  csvContent += `Correct Answers,${data.stats.overview.totalCorrect}\n`;
  csvContent += `Practice Sessions,${data.stats.overview.totalSessions}\n`;
  csvContent += `Study Time (minutes),${data.stats.overview.totalStudyTime}\n`;
  csvContent += `Average Session Score,${data.stats.overview.averageSessionScore}%\n`;
  if (data.streak) {
    csvContent += `Learning Streak (days),${data.streak}\n`;
  }

  csvContent += '\n\nDIFFICULTY PERFORMANCE\n';
  csvContent += 'Difficulty,Correct,Total,Accuracy\n';
  csvContent += `Easy,${data.stats.overview.easyCorrect},${data.stats.overview.easyTotal},${Math.round((data.stats.overview.easyCorrect / data.stats.overview.easyTotal) * 100) || 0}%\n`;
  csvContent += `Medium,${data.stats.overview.mediumCorrect},${data.stats.overview.mediumTotal},${Math.round((data.stats.overview.mediumCorrect / data.stats.overview.mediumTotal) * 100) || 0}%\n`;
  csvContent += `Hard,${data.stats.overview.hardCorrect},${data.stats.overview.hardTotal},${Math.round((data.stats.overview.hardCorrect / data.stats.overview.hardTotal) * 100) || 0}%\n`;

  // Subject Breakdown
  if (data.stats.subjectBreakdown.length > 0) {
    csvContent += '\n\nSUBJECT PERFORMANCE\n';
    csvContent += 'Subject,Correct,Total,Accuracy\n';
    data.stats.subjectBreakdown.forEach(subject => {
      csvContent += `${subject.name},${subject.correct},${subject.totalQuestions},${Math.round(subject.accuracy)}%\n`;
    });
  }

  // Recent Sessions
  if (data.stats.recentSessions.length > 0) {
    csvContent += '\n\nRECENT SESSIONS\n';
    csvContent += 'Date,Score,Questions,Correct,Accuracy\n';
    data.stats.recentSessions.forEach(session => {
      const date = new Date(session.date).toLocaleDateString();
      const accuracy = Math.round((session.correct / session.questions) * 100);
      csvContent += `${date},${session.score.toFixed(1)}%,${session.questions},${session.correct},${accuracy}%\n`;
    });
  }

  // Peer Comparison
  if (data.peerComparison) {
    csvContent += '\n\nPEER COMPARISON\n';
    csvContent += 'Metric,Your Score,Class Average\n';
    csvContent += `Accuracy,${data.peerComparison.yourAccuracy}%,${data.peerComparison.averageAccuracy}%\n`;
    csvContent += `Percentile Rank,Top ${100 - data.peerComparison.percentile}%,-\n`;
  }

  // Download CSV
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
  element.setAttribute('download', `AceWAEC_Report_${studentName}_${new Date().toISOString().split('T')[0]}.csv`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/**
 * Generate shareable summary
 */
export const generateShareableSummary = (data: DashboardData): string => {
  return `
📚 My AceWAEC Progress Report 📚

🎯 Overall Accuracy: ${data.stats.overview.overallAccuracy}%
✅ Questions Answered: ${data.stats.overview.totalCorrect}/${data.stats.overview.totalQuestions}
📊 Study Sessions: ${data.stats.overview.totalSessions}
⏱️ Total Study Time: ${data.stats.overview.totalStudyTime} minutes
${data.streak ? `🔥 Learning Streak: ${data.streak} days!` : ''}

Track your progress on AceWAEC Pro today! 🚀
  `.trim();
};
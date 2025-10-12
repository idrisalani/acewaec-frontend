import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentInfo {
    firstName: string;
    lastName: string;
    email: string;
    studentCategory: string;
    avatar?: string;
}

interface ExamResult {
    examName: string;
    overallScore: number;
    completionDate: Date;
    examDays: Array<{
        dayNumber: number;
        subject: { name: string; code: string };
        score: number;
        correctAnswers: number;
        totalQuestions: number;
    }>;
}

export class PDFService {
    static async generateComprehensiveExamReport(
        student: StudentInfo,
        results: ExamResult
    ) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Header - Logo/Title
        doc.setFillColor(79, 70, 229); // Indigo
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('AceWAEC Pro', pageWidth / 2, 20, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Comprehensive Exam Report', pageWidth / 2, 32, { align: 'center' });

        // Student Photo (if available)
        let yPosition = 55;
        if (student.avatar) {
            try {
                doc.addImage(student.avatar, 'JPEG', pageWidth / 2 - 15, yPosition, 30, 30, undefined, 'FAST');
                yPosition += 35;
            } catch (error) {
                console.error('Failed to add image:', error);
                yPosition += 5;
            }
        } else {
            // Placeholder circle for photo
            doc.setFillColor(200, 200, 200);
            doc.circle(pageWidth / 2, yPosition + 15, 15, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.text('No Photo', pageWidth / 2, yPosition + 17, { align: 'center' });
            yPosition += 40;
        }

        // Student Information
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`${student.firstName} ${student.lastName}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(student.email, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 6;
        doc.setTextColor(79, 70, 229);
        doc.setFont('helvetica', 'bold');
        doc.text(`Category: ${student.studentCategory}`, pageWidth / 2, yPosition, { align: 'center' });

        // Exam Details Box
        yPosition += 15;
        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(0.5);
        doc.rect(15, yPosition, pageWidth - 30, 30);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Exam Information', 20, yPosition + 10);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Exam: ${results.examName}`, 20, yPosition + 18);
        doc.text(`Date: ${new Date(results.completionDate).toLocaleDateString()}`, 20, yPosition + 24);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        const scoreColor = results.overallScore >= 75 ? [34, 197, 94] as [number, number, number] :
            results.overallScore >= 50 ? [234, 179, 8] as [number, number, number] :
                [239, 68, 68] as [number, number, number];
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.text(`Overall Score: ${results.overallScore.toFixed(1)}%`, pageWidth - 20, yPosition + 20, { align: 'right' });

        // Grade
        const grade = this.getGrade(results.overallScore);
        doc.setFontSize(24);
        doc.text(`Grade: ${grade}`, pageWidth - 20, yPosition + 28, { align: 'right' });

        // Subject Results Table
        yPosition += 40;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Subject Results', 15, yPosition);

        yPosition += 5;

        // Prepare table data
        const tableData = results.examDays.map(day => [
            `Day ${day.dayNumber}`,
            day.subject.name,
            day.subject.code,
            `${day.correctAnswers}/${day.totalQuestions}`,
            `${day.score.toFixed(1)}%`,
            this.getGrade(day.score)
        ]);

        autoTable(doc, {
            startY: yPosition,
            head: [['Day', 'Subject', 'Code', 'Correct/Total', 'Score', 'Grade']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 60 },
                2: { cellWidth: 20 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
                5: { cellWidth: 20, fontStyle: 'bold' }
            },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index === 5) {
                    const grade = data.cell.raw as string;
                    if (grade === 'A' || grade === 'B') {
                        data.cell.styles.textColor = [34, 197, 94]; // Green
                    } else if (grade === 'C') {
                        data.cell.styles.textColor = [234, 179, 8]; // Yellow
                    } else {
                        data.cell.styles.textColor = [239, 68, 68]; // Red
                    }
                }
            }
        });

        // Footer
        interface DocWithAutoTable extends jsPDF {
            lastAutoTable?: {
                finalY: number;
            };
        }

        const finalY: number = (doc as DocWithAutoTable).lastAutoTable?.finalY || yPosition + 80;
        const footerY = pageHeight - 30;

        if (finalY < footerY - 20) {
            doc.setDrawColor(200, 200, 200);
            doc.line(15, footerY - 10, pageWidth - 15, footerY - 10);

            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(
                'This is an official certificate from AceWAEC Pro confirming successful completion of the 7-Day Comprehensive Examination.',
                pageWidth / 2,
                footerY,
                { align: 'center', maxWidth: pageWidth - 40 }
            );

            doc.setFontSize(7);
            doc.text(
                `Generated on ${new Date().toLocaleString()}`,
                pageWidth / 2,
                footerY + 8,
                { align: 'center' }
            );
        }

        // Save PDF
        const filename = `${student.firstName}_${student.lastName}_Comprehensive_Exam_Report.pdf`;
        doc.save(filename);
    }

    private static getGrade(score: number): string {
        if (score >= 75) return 'A';
        if (score >= 65) return 'B';
        if (score >= 50) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    }
}
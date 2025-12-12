import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { toast } from "sonner";

// --- Helper: Robust Currency Formatter (Uses 'INR' to avoid font issues) ---
const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return "INR 0";

  // We manually format to ensure 'INR' text is used instead of the symbol
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numericAmount);

  return `INR ${formattedNumber}`;
};

export const generatePayslip = (payroll, employeeDetails) => {
  if (!payroll || !employeeDetails) {
    toast.error("Cannot generate payslip: Missing data.");
    return;
  }

  try {
    const doc = new jsPDF();

    // --- 1. Watermark (Security Feature) ---
    doc.setTextColor(240, 240, 240); // Very light grey
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    // Rotated text for watermark
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text("CONFIDENTIAL", 30, 150, { angle: 45 });
    doc.restoreGraphicsState();

    // --- 2. Professional Header ---
    // Deep Corporate Blue Top Bar
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, 210, 40, 'F');
    
    // Hospital/Company Name (Top Left)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DocSync", 14, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("Excellence in Doctor Management", 14, 24);

    // "PAYSLIP" Label (Top Right)
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("PAYSLIP", 196, 20, null, null, "right");
    doc.setFontSize(10);
    doc.text(`${payroll.month || ""} ${payroll.year || ""}`, 196, 28, null, null, "right");

    // --- 3. Employee & Payment Details ---
    const startY = 55;
    
    // Left Box: Employee Info
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("EMPLOYEE DETAILS", 14, startY);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Name:`, 14, startY + 6);
    doc.text(`Employee ID:`, 14, startY + 11);
    doc.text(`Department:`, 14, startY + 16);

    // Values (Aligned)
    doc.setFont("helvetica", "bold");
    doc.text(employeeDetails.name || "N/A", 45, startY + 6);
    doc.text(String(employeeDetails.id || "N/A"), 45, startY + 11);
    doc.text("Medical Staff", 45, startY + 16);

    // Right Box: Payment Meta
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("PAYMENT SUMMARY", 120, startY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Pay Date:`, 120, startY + 6);
    doc.text(`Processed By:`, 120, startY + 11);
    doc.text(`Mode:`, 120, startY + 16);

    doc.setFont("helvetica", "bold");
    doc.text(format(new Date(), "dd MMM, yyyy"), 155, startY + 6);
    doc.text("Admin System", 155, startY + 11);
    doc.text("Bank Transfer", 155, startY + 16);

    // Separator Line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(14, startY + 25, 196, startY + 25);

    // --- 4. Modern Data Table ---
    autoTable(doc, {
      startY: startY + 35,
      head: [['Description', 'Earnings', 'Deductions']],
      body: [
        ['Basic Salary', formatCurrency(payroll.grossSalary), '-'],
        ['HRA & Allowances', '-', '-'], // Placeholder for future expansion
        ['Tax / TDS', '-', formatCurrency(payroll.deductions)],
        ['Provident Fund', '-', '-'], // Placeholder
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 41, 59], // Slate-800
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' }, // Description
        1: { cellWidth: 40, halign: 'right', textColor: [22, 163, 74] }, // Earnings (Green)
        2: { cellWidth: 40, halign: 'right', textColor: [220, 38, 38] }, // Deductions (Red)
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 5, 
        lineColor: [226, 232, 240] 
      },
      // Draw the "Total" box after the table
      // eslint-disable-next-line no-unused-vars
      didDrawPage: (data) => {
         // This hook runs after the table is drawn, but it's simpler to draw manually after table using finalY
      }
    });

    // --- 5. Total Net Pay Box (The "Modern" Touch) ---
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Background Box for Net Pay
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(203, 213, 225); // Slate-300
    doc.roundedRect(120, finalY, 76, 25, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("NET PAYABLE AMOUNT", 125, finalY + 8);

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Dark
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(payroll.netSalary), 190, finalY + 18, null, null, "right");

    // --- 6. Secure Footer ---
    const pageHeight = doc.internal.pageSize.height;
    
    // Security Hash
    const secureHash = `SEC-ID: ${employeeDetails.id}-${payroll.id || Math.floor(Math.random()*10000)}-${Date.now().toString().slice(-6)}`;
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(secureHash, 14, pageHeight - 15);
    doc.text("This is a computer-generated document. No signature required.", 196, pageHeight - 15, null, null, "right");
    
    // Bottom Bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 5, 210, 5, 'F');

    // --- 7. Save ---
    const filename = `Payslip_${(payroll.month || "Doc").substring(0,3)}_${payroll.year || "2025"}.pdf`;
    doc.save(filename);
    toast.success("Secure payslip downloaded.");

  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Failed to generate PDF.");
  }
};
import React from 'react';
import { Download } from 'lucide-react';
import { Patient, Medication, Administration } from '../types';
import { users } from '../data/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// @ts-ignore
import jsPDF from 'jspdf';

interface PDFGeneratorProps {
  patient: Patient;
  medications: Medication[];
  administrations: Administration[];
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ patient, medications, administrations }) => {
  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || 'Usuario desconocido';
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text('Animal Sweet - Kardex Veterinario', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, yPosition);
    yPosition += 20;

    // Patient Info
    doc.setFontSize(16);
    doc.text('INFORMACIÓN DEL PACIENTE', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Nombre: ${patient.name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Especie: ${patient.species} - Raza: ${patient.breed}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Edad: ${patient.age} - Peso: ${patient.weight} kg`, 20, yPosition);
    yPosition += 7;
    doc.text(`Propietario: ${patient.owner}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Teléfono: ${patient.ownerPhone}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Jaula: ${patient.cage}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Fecha de ingreso: ${format(new Date(patient.admission_date), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Diagnóstico: ${patient.diagnosis}`, 20, yPosition);
    yPosition += 20;

    // Medications
    doc.setFontSize(16);
    doc.text('PLAN DE MEDICACIÓN', 20, yPosition);
    yPosition += 10;

    medications.forEach((med, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(`${index + 1}. ${med.medication_name}`, 20, yPosition);
      yPosition += 7;
      doc.text(`   Dosis: ${med.dose} - Frecuencia: ${med.frequency}`, 25, yPosition);
      yPosition += 7;
      doc.text(`   Vía: ${med.route} - Estado: ${med.status}`, 25, yPosition);
      yPosition += 7;
      doc.text(`   Período: ${format(new Date(med.start_date), 'dd/MM/yyyy', { locale: es })} - ${format(new Date(med.end_date), 'dd/MM/yyyy', { locale: es })}`, 25, yPosition);
      yPosition += 7;
      doc.text(`   Prescrito por: ${getUserName(med.prescribed_by)}`, 25, yPosition);
      yPosition += 7;
      if (med.instructions) {
        doc.text(`   Instrucciones: ${med.instructions}`, 25, yPosition);
        yPosition += 7;
      }
      yPosition += 5;
    });

    // Administrations
    if (administrations.length > 0) {
      yPosition += 10;
      doc.setFontSize(16);
      doc.text('REGISTRO DE ADMINISTRACIONES', 20, yPosition);
      yPosition += 10;

      administrations.forEach((admin, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        const medication = medications.find(m => m.id === admin.medication_id);
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${medication?.medication_name || 'Medicamento desconocido'}`, 20, yPosition);
        yPosition += 7;
        doc.text(`   Dosis: ${admin.dose} - Estado: ${admin.status}`, 25, yPosition);
        yPosition += 7;
        doc.text(`   Fecha: ${format(new Date(admin.administered_at), 'dd/MM/yyyy HH:mm', { locale: es })}`, 25, yPosition);
        yPosition += 7;
        doc.text(`   Administrado por: ${getUserName(admin.administered_by)}`, 25, yPosition);
        yPosition += 7;
        if (admin.notes) {
          doc.text(`   Observaciones: ${admin.notes}`, 25, yPosition);
          yPosition += 7;
        }
        yPosition += 5;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, 20, 280);
      doc.text('Animal Sweet - Sistema de Kardex Veterinario', 120, 280);
    }

    doc.save(`kardex-${patient.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
    >
      <Download className="h-4 w-4" />
      <span>Descargar PDF</span>
    </button>
  );
};

export default PDFGenerator;
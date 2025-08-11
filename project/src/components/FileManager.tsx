import React, { useState, useRef } from 'react';
import { Upload, File, Image, FileText, X, Download, Eye, Trash2, Plus } from 'lucide-react';
import { Patient, PatientFile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { users } from '../data/mockData';

interface FileManagerProps {
  patient: Patient;
  onClose: () => void;
  onUpdate: () => void;
}

const FileManager: React.FC<FileManagerProps> = ({ patient, onClose, onUpdate }) => {
  const { user } = useAuth();
  const { updatePatient, addKardexEntry } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PatientFile | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      uploadFile(file);
    });
  };

    const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      // In a real application, you would upload to a cloud storage service
      // For this demo, we'll create a mock URL
      const fileUrl = URL.createObjectURL(file);
      
      const fileType = getFileType(file);
      
      const newFile: PatientFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        patient_id: patient.id,
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        uploaded_by: user?.id || '',
        uploaded_at: new Date().toISOString(),
        file_url: fileUrl,
        description: ''
      };

      // Update patient files
      const updatedFiles = [...patient.files, newFile];
      updatePatient(patient.id, { files: updatedFiles });

      // Add kardex entry
        addKardexEntry({
          patient_id: patient.id,
          type: 'archivo',
          content: `Archivo subido: ${file.name} (${getFileTypeText(fileType)})`,
          created_by: user?.id || '',
          related_file_id: newFile.id
        });

      onUpdate();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo');
    } finally {
      setIsUploading(false);
    }
  };

    const getFileType = (file: File): PatientFile['file_type'] => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.startsWith('image/')) return 'image';
    if (name.includes('xray') || name.includes('radiografia')) return 'xray';
    if (name.includes('lab') || name.includes('laboratorio') || name.includes('examen')) return 'lab_result';
    if (type.includes('pdf') || type.includes('document')) return 'document';
    
    return 'other';
  };

    const getFileTypeText = (type: PatientFile['file_type']) => {
    switch (type) {
      case 'image': return 'Imagen';
      case 'document': return 'Documento';
      case 'lab_result': return 'Resultado de Laboratorio';
      case 'xray': return 'Radiografía';
      case 'other': return 'Otro';
      default: return 'Archivo';
    }
  };

    const getFileIcon = (type: PatientFile['file_type']) => {
    switch (type) {
      case 'image':
      case 'xray':
        return <Image className="h-5 w-5" />;
      case 'document':
      case 'lab_result':
        return <FileText className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

    const getFileTypeColor = (type: PatientFile['file_type']) => {
    switch (type) {
      case 'image': return 'text-primary-600 dark:text-primary-400';
      case 'xray': return 'text-accent-600 dark:text-accent-400';
      case 'document': return 'text-secondary-600 dark:text-secondary-400';
      case 'lab_result': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteFile = (fileId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este archivo?')) return;

    const updatedFiles = patient.files.filter(f => f.id !== fileId);
    updatePatient(patient.id, { files: updatedFiles });

    const deletedFile = patient.files.find(f => f.id === fileId);
    if (deletedFile) {
        addKardexEntry({
          patient_id: patient.id,
          type: 'archivo',
          content: `Archivo eliminado: ${deletedFile.file_name}`,
          created_by: user?.id || ''
        });
    }

    onUpdate();
  };

  const handleViewFile = (file: PatientFile) => {
    setSelectedFile(file);
    setShowViewer(true);
  };

  const handleDownloadFile = (file: PatientFile) => {
    // In a real application, this would download from cloud storage
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.name || 'Usuario desconocido';
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-dark-800 flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-secondary-500 to-primary-500 p-2 rounded-full shadow-lg">
                <File className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Archivos Médicos - {patient.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exámenes, radiografías y documentos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-8 text-center hover:border-secondary-400 dark:hover:border-secondary-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Subir archivos médicos
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Formatos soportados: JPG, PNG, PDF, DOC, TXT (máx. 10MB)
                </p>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-6 py-2 rounded-md hover:from-secondary-700 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>{isUploading ? 'Subiendo...' : 'Seleccionar Archivos'}</span>
              </button>
            </div>

            {/* Files Grid */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Archivos del Paciente ({patient.files.length})
              </h4>

              {patient.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.files
                    .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
                    .map((file) => (
                      <div key={file.id} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-gray-200 dark:border-dark-600 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 rounded-full bg-white dark:bg-dark-600 ${getFileTypeColor(file.file_type)}`}>
                            {getFileIcon(file.file_type)}
                          </div>
                          <div className="flex space-x-1">
                            {file.file_type === 'image' && (
                              <button
                                onClick={() => handleViewFile(file)}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                title="Ver imagen"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors"
                              title="Descargar"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate" title={file.file_name}>
                            {file.file_name}
                          </h5>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              file.file_type === 'image' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' :
                              file.file_type === 'xray' ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-300' :
                              file.file_type === 'lab_result' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                              'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300'
                            }`}>
                              {getFileTypeText(file.file_type)}
                            </span>
                            <span>{formatFileSize(file.file_size)}</span>
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                            <p>Subido por: {getUserName(file.uploaded_by)}</p>
                            <p>{format(new Date(file.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                          </div>

                          {file.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-600 p-2 rounded">
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <File className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-lg font-medium mb-2">No hay archivos subidos</p>
                  <p className="text-sm">Sube el primer archivo médico del paciente</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-dark-700 border-t border-gray-200 dark:border-dark-600 rounded-b-lg">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Desarrollado por <span className="font-medium text-primary-600 dark:text-primary-400">andresch</span> de{' '}
              <a href="https://t.me/tiendastelegram" target="_blank" rel="noopener noreferrer" className="text-secondary-600 dark:text-secondary-400 hover:underline">
                @tiendastelegram
              </a>
              {' '}© 2025 Animal Sweet
            </p>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {showViewer && selectedFile && selectedFile.file_type === 'image' && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowViewer(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedFile.file_url}
              alt={selectedFile.file_name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
              <h4 className="font-medium">{selectedFile.file_name}</h4>
              <p className="text-sm text-gray-300">
                {getFileTypeText(selectedFile.file_type)} • {formatFileSize(selectedFile.file_size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileManager;
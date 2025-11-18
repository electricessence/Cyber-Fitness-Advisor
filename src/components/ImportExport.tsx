/**
 * Data Import/Export Component - Task E: UX Polish
 * Allows users to backup and restore their assessment data
 */

import { useState } from 'react';
import { Download, Upload, FileText, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useAssessmentStore } from '../features/assessment/state/store';
import { readStorage, writeStorage } from '../utils/safeStorage';

interface ExportData {
  version: string;
  timestamp: string;
  answers: Record<string, any>;
  deviceProfile: any;
  earnedBadges: string[];
  contentVersion: string;
}

interface ImportExportProps {
  className?: string;
}

export function ImportExport({ className = "" }: ImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const { answers, deviceProfile, earnedBadges, setFact, getFact, hasFact } = useAssessmentStore();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // MIGRATION DEMO: Track export usage with simple Registry methods
      setFact('last_export_date', new Date().toISOString());
      setFact('export_count', (getFact('export_count') || 0) + 1);
      setFact('user_prefers_backups', true);
      
      const exportData: ExportData = {
        version: '2.5.0',
        timestamp: new Date().toISOString(),
        answers,
        deviceProfile,
        earnedBadges,
        contentVersion: readStorage('cfa:v2:contentVersion') || '1.0.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportName = `cyber-fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();
      
      // Small delay for UX feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Export failed:', error);
    }
    
    setIsExporting(false);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('idle');
    
    try {
      const text = await file.text();
      const importData: ExportData = JSON.parse(text);
      
      // Validate the import data structure
      if (!importData.version || !importData.answers) {
        throw new Error('Invalid backup file format');
      }
      
      // Version compatibility check
      const majorVersion = importData.version.split('.')[0];
      if (majorVersion !== '2') {
        throw new Error('Backup file is from an incompatible version');
      }
      
      // Import the data
      const store = useAssessmentStore.getState();
      
      // Clear current data first
      store.resetAssessment();
      
      // Import answers
      Object.entries(importData.answers).forEach(([questionId, answer]) => {
        store.answerQuestion(questionId, answer.value);
      });
      
      // Import device profile if available
      if (importData.deviceProfile) {
        store.setDeviceProfile(importData.deviceProfile);
      }
      
      // MIGRATION DEMO: Track import usage with simple Registry methods
      const { setFact, getFact } = store;
      setFact('last_import_date', new Date().toISOString());
      setFact('import_count', (getFact('import_count') || 0) + 1);
      setFact('has_imported_data', true);
      
      // Update localStorage items
      if (importData.contentVersion) {
        writeStorage('cfa:v2:contentVersion', importData.contentVersion);
      }
      
      setImportStatus('success');
      setImportMessage(`Successfully imported ${Object.keys(importData.answers).length} answers from ${new Date(importData.timestamp).toLocaleDateString()}`);
      
    } catch (error: any) {
      setImportStatus('error');
      setImportMessage(error.message || 'Failed to import backup file');
    }
    
    setIsImporting(false);
    
    // Reset file input
    event.target.value = '';
  };

  const getAnswerCount = () => Object.keys(answers).length;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Data Backup & Restore
        </h3>
        <p className="text-sm text-gray-600">
          Export your assessment data as a backup file, or import a previous backup to restore your progress.
        </p>
      </div>

      {/* Current Data Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Current Data</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Answered Questions:</span>
            <span className="ml-2 font-medium">{getAnswerCount()}</span>
          </div>
          <div>
            <span className="text-gray-600">Earned Badges:</span>
            <span className="ml-2 font-medium">{earnedBadges.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Device Profile:</span>
            <span className="ml-2 font-medium">{deviceProfile ? 'Configured' : 'Not set'}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          
          {/* MIGRATION DEMO: Show Registry-based analytics */}
          {hasFact('export_count') && (
            <div>
              <span className="text-gray-600">Exports:</span>
              <span className="ml-2 font-medium">{getFact('export_count')}</span>
            </div>
          )}
          {hasFact('import_count') && (
            <div>
              <span className="text-gray-600">Imports:</span>
              <span className="ml-2 font-medium">{getFact('import_count')}</span>
            </div>
          )}
          {getFact('user_prefers_backups') && (
            <div className="text-green-600">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              <span className="text-sm">Backup-savvy user!</span>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="mb-6">
        <button
          onClick={handleExport}
          disabled={isExporting || getAnswerCount() === 0}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export My Data
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          {getAnswerCount() === 0 
            ? 'Complete some questions first to enable export'
            : 'Downloads a JSON file with all your assessment data'
          }
        </p>
      </div>

      {/* Import Section */}
      <div className="mb-4">
        <label className="block">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isImporting}
            className="sr-only"
          />
          <div className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer">
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import Backup File
              </>
            )}
          </div>
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Select a previously exported JSON backup file
        </p>
      </div>

      {/* Import Status */}
      {importStatus !== 'idle' && (
        <div className={`p-3 rounded-lg flex items-start gap-2 ${
          importStatus === 'success' 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {importStatus === 'success' ? (
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium text-sm">
              {importStatus === 'success' ? 'Import Successful' : 'Import Failed'}
            </p>
            <p className="text-xs mt-1">{importMessage}</p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Privacy First</p>
            <p className="text-xs text-blue-800 mt-1">
              All data stays on your device. Export files contain only your assessment answers 
              and preferences - no personal information or tracking data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ResetModalProps {
  showResetModal: boolean;
  setShowResetModal: (show: boolean) => void;
  onReset: () => void;
}

export function ResetModal({ showResetModal, setShowResetModal, onReset }: ResetModalProps) {
  if (!showResetModal) return null;

  const handleReset = () => {
    onReset();
    setShowResetModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Reset All Data
        </h3>
        <p className="text-gray-600 mb-6">
          This will permanently delete all your answers and progress. Are you sure you want to continue?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowResetModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reset Everything
          </button>
        </div>
      </div>
    </div>
  );
}

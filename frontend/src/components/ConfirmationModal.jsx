import React from "react";
import { RxCross2 } from "react-icons/rx";

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message, 
  confirmText = "Yes, Continue", 
  cancelText = "Cancel" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[99999]">
      <div className="bg-white dark:bg-themeBG w-full max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-4 border-b dark:border-gray-700">
          <h4 className="text-xl font-bold text-gray-800 dark:text-themeText">{title}</h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RxCross2 className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 transform active:scale-95 transition-all duration-200"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

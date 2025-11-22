

import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';

export default function BarraProgreso({ currentStep }) {
  const [prevStep, setPrevStep] = useState(currentStep);
  
  useEffect(() => {
    // Solo actualizamos prevStep si currentStep ha aumentado
    if (currentStep > prevStep) {
      setPrevStep(currentStep);
    }
  }, [currentStep, prevStep]);
  return (
    <div className="w-full py-5">
      <div className="flex items-center justify-between max-w-3xl mx-auto relative">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-medium shadow-md transition-all duration-500 ease-in-out transform
              ${currentStep === 1 ? 'bg-indigo-500 scale-110' : currentStep > 1 ? 'bg-green-500 scale-105' : 'bg-gray-300'}`}
          >
            {currentStep > 1 ? (
              <CheckIcon fontSize="small" />
            ) : (
              <span>1</span>
            )}
          </div>
        </div>

        {/* Line between 1 and 2 */}
        <div className="w-full h-1 max-w-xs relative overflow-hidden bg-gray-300">
          <div 
            className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-700 ease-in-out"
            style={{ width: currentStep >= 2 ? '100%' : '0%' }}
          ></div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-medium shadow-md transition-all duration-500 ease-in-out transform
              ${currentStep === 2 ? 'bg-indigo-500 scale-110' : currentStep > 2 ? 'bg-green-500 scale-105' : 'bg-gray-300'}`}
          >
            {currentStep > 2 ? (
              <CheckIcon fontSize="small" />
            ) : (
              <span>2</span>
            )}
          </div>
        </div>

        {/* Line between 2 and 3 */}
        <div className="w-full h-1 max-w-xs relative overflow-hidden bg-gray-300">
          <div 
            className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-700 ease-in-out"
            style={{ width: currentStep >= 3 ? '100%' : '0%' }}
          ></div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-medium shadow-md transition-all duration-500 ease-in-out transform
              ${currentStep === 3 ? 'bg-indigo-500 scale-110' : currentStep > 3 ? 'bg-green-500 scale-105' : 'bg-gray-300'}`}
          >
            {currentStep > 3 ? (
              <CheckIcon fontSize="small" />
            ) : (
              <span>3</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

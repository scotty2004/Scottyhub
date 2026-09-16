import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Fingerprint, Lock, Scan, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BiometricModal: React.FC = () => {
  const { isBiometricModalOpen, closeBiometricAuth, authenticateBiometrics, platform } = useApp();
  const [pinInput, setPinInput] = useState('');
  const [usePinMode, setUsePinMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(false);

  if (!isBiometricModalOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanError(false);

    setTimeout(() => {
      setIsScanning(false);
      authenticateBiometrics();
    }, 1200);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = authenticateBiometrics(pinInput);
    if (!success) {
      setScanError(true);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate([100, 50, 100]);
        } catch {}
      }
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = authenticateBiometrics(nextPin);
          if (!success) {
            setScanError(true);
            setPinInput('');
          }
        }, 200);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-center text-white"
        >
          {/* Close Button */}
          <button
            onClick={closeBiometricAuth}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
              {platform === 'ios' ? <Scan className="w-8 h-8" /> : <Fingerprint className="w-8 h-8" />}
            </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-1">
            {platform === 'ios' ? 'Face ID Verification' : 'Fingerprint Sensor'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            ScottHub Privacy Shield requires biometric authentication to view encrypted local data.
          </p>

          {!usePinMode ? (
            <div className="space-y-6">
              {/* Scan Graphic */}
              <div className="relative flex items-center justify-center py-6">
                <motion.div
                  animate={isScanning ? { scale: [1, 1.15, 1], rotate: [0, 180, 360] } : {}}
                  transition={{ duration: 1.2, repeat: isScanning ? Infinity : 0 }}
                  className={`w-28 h-28 rounded-full flex items-center justify-center border-2 ${
                    scanError
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : isScanning
                      ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                      : 'border-blue-500/30 bg-slate-800/80 text-blue-400 hover:border-blue-500'
                  }`}
                >
                  {platform === 'ios' ? <Scan className="w-14 h-14" /> : <Fingerprint className="w-14 h-14" />}
                </motion.div>

                {/* Laser scan line overlay */}
                {isScanning && (
                  <motion.div
                    animate={{ y: [-40, 40, -40] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8]"
                  />
                )}
              </div>

              {scanError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-medium bg-red-500/10 py-2 rounded-xl border border-red-500/20">
                  <ShieldAlert className="w-4 h-4" />
                  Biometric scan failed. Try again or enter PIN.
                </div>
              )}

              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <span>Scanning Sensors...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Scan {platform === 'ios' ? 'Face ID' : 'Fingerprint'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setUsePinMode(true)}
                className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-4"
              >
                Use 4-Digit Passcode PIN (Default: 1234)
              </button>
            </div>
          ) : (
            /* PIN Passcode Fallback */
            <div className="space-y-5">
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border border-slate-600 transition-all ${
                      pinInput.length > index ? 'bg-blue-500 border-blue-400 scale-110 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {scanError && <p className="text-xs text-red-400 font-medium">Incorrect PIN code. Default is 1234.</p>}

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3 px-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (item === 'C') {
                        setPinInput('');
                        setScanError(false);
                      } else if (item === '⌫') {
                        setPinInput((prev) => prev.slice(0, -1));
                      } else {
                        handlePinDigit(item);
                      }
                    }}
                    className="py-3 bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-white font-medium text-lg rounded-2xl transition border border-slate-700/50"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setUsePinMode(false);
                  setScanError(false);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                Back to {platform === 'ios' ? 'Face ID' : 'Fingerprint'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { initScanner, stopScanner, onDetected, onProcessed, drawDetectionBox } from '@/lib/barcodeScanner';

interface BarcodeScannerComponentProps {
  onDetect: (barcode: string) => void;
}

export default function BarcodeScannerComponent({ onDetect }: BarcodeScannerComponentProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const startScanner = async () => {
    try {
      if (!videoRef.current) return;
      
      setErrorMessage(null);
      setIsScanning(true);
      
      await initScanner('interactive');
      
      // Handle successful detection
      onDetected((result) => {
        if (result.codeResult.code) {
          const barcode = result.codeResult.code;
          stopScanner();
          setIsScanning(false);
          onDetect(barcode);
        }
      });
      
      // Draw detection box
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          onProcessed((result) => {
            drawDetectionBox(result, context);
          });
        }
      }
    } catch (error) {
      console.error("Failed to start scanner:", error);
      setErrorMessage("Camera access failed. Please check your permissions and try again.");
      setIsScanning(false);
    }
  };
  
  const cancelScanning = () => {
    stopScanner();
    setIsScanning(false);
  };
  
  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (isScanning) {
        stopScanner();
      }
    };
  }, [isScanning]);
  
  return (
    <div className="flex flex-col items-center w-full">
      <Card className="bg-slate-800 rounded-xl p-4 w-full max-w-sm">
        <CardContent className="p-0">
          {isScanning ? (
            <div className="relative">
              <div id="interactive" ref={videoRef} className="viewport w-full h-64 overflow-hidden rounded-lg">
                {/* Scanner viewport will be inserted here by Quagga */}
              </div>
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-dashed border-primary rounded-lg pointer-events-none"></div>
            </div>
          ) : (
            <div className="w-full h-64 border-2 border-dashed border-primary rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <span className="material-icons text-5xl text-gray-500 mb-2">qr_code_scanner</span>
                <p className="text-gray-300 mb-2">Position the barcode within the frame to scan</p>
                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full mt-4 bg-primary text-black font-medium"
            onClick={isScanning ? cancelScanning : startScanner}
          >
            {isScanning ? 'Cancel Scanning' : 'Start Scanning'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import Quagga from 'quagga';

interface ScannerConfig {
  inputStream: {
    type: string;
    constraints: {
      width: number;
      height: number;
      facingMode: string;
    };
    area?: {
      top?: string;
      right?: string;
      left?: string;
      bottom?: string;
    };
  };
  locator: {
    patchSize: string;
    halfSample: boolean;
  };
  numOfWorkers: number;
  frequency: number;
  decoder: {
    readers: string[];
  };
  locate: boolean;
}

// Initialize the barcode scanner with a given DOM element
export const initScanner = (elementId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Default scanner configuration
    const config: ScannerConfig = {
      inputStream: {
        type: "LiveStream",
        constraints: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: "environment" // Use the back camera for mobile devices
        },
        area: {
          top: "0%",    // top offset
          right: "0%",  // right offset
          left: "0%",   // left offset
          bottom: "0%"  // bottom offset
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10,
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "code_128_reader",
          "code_39_reader",
          "code_93_reader",
          "upc_reader",
          "upc_e_reader"
        ]
      },
      locate: true
    };

    try {
      Quagga.init(config, (err) => {
        if (err) {
          console.error("Error initializing Quagga:", err);
          reject(err);
          return;
        }
        
        // If initialization successful, start the scanner
        Quagga.start();
        resolve();
      });
    } catch (error) {
      console.error("Exception while initializing Quagga:", error);
      reject(error);
    }
  });
};

// Stop the scanner
export const stopScanner = (): void => {
  try {
    Quagga.stop();
  } catch (error) {
    console.error("Error stopping Quagga:", error);
  }
};

// Add a detection event listener
export const onDetected = (callback: (data: { codeResult: { code: string } }) => void): void => {
  Quagga.onDetected(callback);
};

// Add a processed event listener for drawing boxes around detected barcodes
export const onProcessed = (callback: (result: any) => void): void => {
  Quagga.onProcessed(callback);
};

// Helper function to draw the detection box
export const drawDetectionBox = (result: any, canvasContext: CanvasRenderingContext2D): void => {
  if (!result) return;
  
  if (result.boxes) {
    canvasContext.clearRect(0, 0, parseInt(canvasContext.canvas.getAttribute("width") || "0"), parseInt(canvasContext.canvas.getAttribute("height") || "0"));
    
    const hasResult = result.boxes.filter((box: any) => box !== result.box);
    hasResult.forEach((box: any) => {
      Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, canvasContext, { color: "green", lineWidth: 2 });
    });
  }

  if (result.box) {
    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, canvasContext, { color: "#00F", lineWidth: 2 });
  }

  if (result.codeResult && result.codeResult.code) {
    Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, canvasContext, { color: 'red', lineWidth: 3 });
  }
};

// Search for food by barcode
export const searchFoodByBarcode = async (barcode: string): Promise<any> => {
  try {
    const response = await fetch(`/api/barcode/${barcode}`);
    if (!response.ok) {
      throw new Error("Product not found");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching barcode data:", error);
    throw error;
  }
};

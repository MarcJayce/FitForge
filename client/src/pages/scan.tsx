import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BarcodeScannerComponent from '@/components/BarcodeScannerComponent';
import { searchFoodByBarcode } from '@/lib/barcodeScanner';
import { useFoodItems } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const { foodItems, isLoading, createFoodItem } = useFoodItems();
  const { toast } = useToast();
  
  // Mock recent scans (these would normally come from storage)
  const recentScans = [
    { id: 1, name: 'Protein Bar', calories: 220 },
    { id: 2, name: 'Greek Yogurt', calories: 130 },
    { id: 3, name: 'Energy Drink', calories: 160 }
  ];
  
  const handleBarcodeDetection = async (barcode: string) => {
    try {
      setScanError(null);
      const product = await searchFoodByBarcode(barcode);
      setScannedProduct(product);
      setScanning(false);
    } catch (error) {
      setScanError('Product not found. Try searching manually.');
      setScanning(false);
    }
  };
  
  const handleAddToFoodItems = () => {
    if (!scannedProduct) return;
    
    createFoodItem({
      userId: 1,
      name: scannedProduct.name,
      calories: scannedProduct.calories,
      protein: scannedProduct.protein,
      carbs: scannedProduct.carbs,
      fat: scannedProduct.fat,
      servingSize: scannedProduct.servingSize,
      barcode: scannedProduct.barcode || ''
    });
    
    toast({
      title: "Food Added",
      description: `${scannedProduct.name} was added to your food items`,
    });
    
    setScannedProduct(null);
  };

  return (
    <main className="h-full flex flex-col">
      <div className="p-4 text-center">
        <h2 className="text-lg font-montserrat font-bold mb-1">Food Scanner</h2>
        <p className="text-sm text-gray-400 font-poppins">Scan a barcode to add food quickly</p>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {scanning ? (
          <BarcodeScannerComponent onDetect={handleBarcodeDetection} />
        ) : scannedProduct ? (
          <Card className="bg-slate-800 rounded-xl p-4 w-full max-w-sm">
            <CardContent className="p-2">
              <h3 className="font-montserrat font-bold text-white text-xl mb-4 text-center">{scannedProduct.name}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Calories:</span>
                  <span className="font-medium text-white">{scannedProduct.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Protein:</span>
                  <span className="font-medium text-white">{scannedProduct.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Carbs:</span>
                  <span className="font-medium text-white">{scannedProduct.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Fat:</span>
                  <span className="font-medium text-white">{scannedProduct.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Serving Size:</span>
                  <span className="font-medium text-white">{scannedProduct.servingSize}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-primary text-black"
                  onClick={handleAddToFoodItems}
                >
                  Add to My Foods
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setScannedProduct(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 rounded-xl p-6 w-full max-w-xs text-center">
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-primary rounded-lg flex items-center justify-center mb-4">
              <span className="material-icons text-5xl text-gray-500">qr_code_scanner</span>
            </div>
            <p className="text-gray-300 mb-4">Position the barcode within the frame to scan</p>
            {scanError && <p className="text-red-500 mb-4">{scanError}</p>}
            <Button 
              className="bg-primary text-black rounded-lg py-2 px-4 font-medium w-full"
              onClick={() => setScanning(true)}
            >
              Start Scanning
            </Button>
          </Card>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-3">Recent Scans</p>
          <div className="flex flex-wrap justify-center gap-3">
            {recentScans.map(item => (
              <div key={item.id} className="bg-slate-800 rounded-xl p-3 w-28">
                <div className="w-full h-16 bg-slate-900 rounded-lg flex items-center justify-center mb-2">
                  <span className="material-icons text-gray-500">inventory_2</span>
                </div>
                <p className="text-xs text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-400">{item.calories} cal</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

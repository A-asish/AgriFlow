import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { X } from 'lucide-react';
export const LocationModal = ({ isOpen, onClose, onSave, currentCity }) => {
    const [newCity, setNewCity] = useState(currentCity);
    if (!isOpen)
        return null;
    const handleSave = () => {
        if (newCity.trim()) {
            onSave(newCity.trim());
            onClose();
        }
    };
    return (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5"/>
        </button>
        
        <h3 className="text-xl font-bold mb-4">Change Location</h3>
        
        <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Enter city name (e.g., Pokhara, Biratnagar)" className="w-full p-3 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" onKeyPress={(e) => e.key === 'Enter' && handleSave()}/>
        
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            Save Location
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>);
};

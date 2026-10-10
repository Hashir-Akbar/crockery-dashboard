import React, { useState } from 'react';
import { Area } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveArea: (area: Area) => void;
}

export function AddAreaModal({ isOpen, onClose, onSaveArea }: AddAreaModalProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newArea: Area = {
      id: 'area-' + Date.now(),
      name: name.trim(),
      city: city.trim() || name.trim(),
      code: code.trim().toUpperCase() || name.trim().slice(0, 3).toUpperCase(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveArea(newArea);
    setName('');
    setCity('');
    setCode('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Wholesale Supply City / Area"
      description="Create a territory hub (e.g. Sillanwali, Sargodha, Faisalabad) to organize retail shops"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>City / Area Name *</Label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!code) setCode(e.target.value.slice(0, 3).toUpperCase());
            }}
            placeholder="e.g. Sillanwali, Chiniot, or Sargodha Market"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>District / Region</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Sargodha District"
            />
          </div>
          <div>
            <Label>Short Code (3-4 Letters)</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SLW"
              maxLength={6}
            />
          </div>
        </div>

        <div>
          <Label>Supply Route Notes</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Weekly goods carrier truck delivery schedule"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
            Create City / Area
          </Button>
        </div>
      </form>
    </Modal>
  );
}

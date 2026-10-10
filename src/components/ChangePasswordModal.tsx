import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { KeyRound, Check } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPassword: string;
  onSavePassword: (newPass: string) => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  currentPassword,
  onSavePassword,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError('Password cannot be empty.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onSavePassword(newPassword.trim());
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Dashboard Admin Password"
      description="Set a new secret password to lock and protect your wholesale dashboard"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {success ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Password updated successfully!
          </div>
        ) : (
          <>
            <div>
              <Label>New Admin Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter new password..."
                required
                autoFocus
              />
            </div>

            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Repeat new password..."
                required
              />
            </div>

            {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Save Password
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

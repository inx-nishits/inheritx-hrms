'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface LeaveDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  leaveId: string | null;
}

export function LeaveDetailsSidebar({
  isOpen,
  onClose,
  leaveId,
}: LeaveDetailsSidebarProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave Details" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {leaveId
            ? `Details for leave request ${leaveId} will appear here.`
            : 'No leave request selected.'}
        </p>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}



"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { Loader2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  itemName: string;
  itemType?: string;
}

export function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  itemName, 
  itemType 
}: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Excluir
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-red-500/10">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="text-zinc-300">
            Tem certeza que deseja excluir {itemType || "este item"} <strong className="text-white">{itemName}</strong>?
          </p>
          <p className="text-zinc-500 text-sm mt-2">Esta ação não pode ser desfeita.</p>
        </div>
      </div>
    </Modal>
  );
}
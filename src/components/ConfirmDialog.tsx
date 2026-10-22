import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: {
  open: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} title={title || 'Confirmar'} onClose={onCancel}>
      <p>{message}</p>
      <div className="form-actions">
        <button className="btn danger" onClick={onConfirm}>Sí, eliminar</button>
        <button className="btn ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </Modal>
  );
}
import React, { type ReactNode } from 'react'

interface ModalProps {
    content: ReactNode 
}

export const Modal: React.FC<ModalProps> = ({content}) => {
  return (
    <div className="modal-overlay">
        <div className="modal-content">
            {content}
        </div>
    </div>
  )
}

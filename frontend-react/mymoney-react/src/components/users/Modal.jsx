import '../../styles/Modal.scss';
import { createPortal } from 'react-dom';


const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) {
      console.error('modal-root not found in HTML!');
      return null;
    }
    
    return createPortal(
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content"
          onClick={e => e.stopPropagation()}>
            
          <button className='modal-close-btn'
            onClick={onClose}><i className="material-icons">close</i></button>
            {children}
        </div>
      </div>,
      modalRoot
    );
  };
  
  export default Modal;
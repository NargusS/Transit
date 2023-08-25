import '../../../home/Modal.css'
import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";

const NewConv = props => {
    console.log('newconv')
    const closeOnEscapeKeyDown = e => {
      if ((e.charCode || e.keyCode) === 27) {
        props.onClose();
      }
    };
  
    useEffect(() => {
      document.body.addEventListener("keydown", closeOnEscapeKeyDown);
      return function cleanup() {
        document.body.removeEventListener("keydown", closeOnEscapeKeyDown);
      };
    }, );
  
    return (
      <CSSTransition
        in={props.show}
        unmountOnExit
        timeout={{ enter: 0, exit: 300 }}
      >
        <div className="modal" onClick={props.onClose}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>class
              <h4 className="modal-title">{props.title}</h4>
            <div className="modal-body">{props.children}</div>
              <button onClick={props.onClose}>
                CANCEL
              </button>
            </div>
          </div>
      </CSSTransition>
    );
  };
  
  export default NewConv;
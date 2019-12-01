import React from 'react';
import ForceDirectedGraph from '../ForceGraph/ForceGraph.jsx';
import Modal from 'react-modal';

export default class ForceModal extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        const {
            title, isOpen, setModalOpen, activeGraph, selectedYear, fields
          } = this.props;
        return (
            <Modal
                id="test"
                contentLabel="modalA"
                closeTimeoutMS={150}
                isOpen={isOpen}
                ariaHideApp={false}
                onRequestClose={()=>setModalOpen(false)}>
                <h1>{title}</h1>
                <button onClick={()=>setModalOpen(false)}>close</button>
                <ForceDirectedGraph activeGraph={activeGraph} selectedYear={selectedYear} fields={fields}/>
            </Modal>
        )
    }
}
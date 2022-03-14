import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { CButton, CDataTable, CInput, CInputGroup, CInputGroupAppend, CInputGroupText } from '@coreui/react';

const GroupRateModal = ({ priceGroups, setPriceGroups, mainView = true }) => {

    const itemsPerPage = 50;
    const [modalShow, setModalShow] = useState(false);

    const handleSubmit = () => setModalShow(false);

    const handleGroupRate = ({ currentTarget }, group) => {
        const newGroups = priceGroups.map(g => g.id === group.id ? {...group, rate: currentTarget.value} : g);
        setPriceGroups(newGroups);
    };

    return (
        <>
            <CButton size="sm" color="warning" onClick={ () => setModalShow(true) } className="mx-1 my-1" style={{ height: '35px' }} disabled={ !mainView }>Editer les marges</CButton>

            <Modal show={ modalShow } onHide={ () => setModalShow(false) } size="md" aria-labelledby="contained-modal-title-vcenter" centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Marges idéale par groupe
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '300px', overflow: 'scroll' }}>
                    <CDataTable
                        items={ priceGroups }
                        fields={ ['Groupe', 'Marge'] }
                        bordered
                        itemsPerPage={ itemsPerPage }
                        pagination
                        hover
                        scopedSlots = {{
                            'Groupe':
                                item => <td>{ item.name }</td>
                            ,
                            'Marge':
                                item => <td>
                                            <CInputGroup>
                                                <CInput
                                                    type="number"
                                                    name={ item.id }
                                                    value={ item.rate }
                                                    onChange={ e => handleGroupRate(e, item) }
                                                    style={{ maxWidth: '180px'}}
                                                />
                                                <CInputGroupAppend>
                                                    <CInputGroupText style={{ minWidth: '43px'}}>%</CInputGroupText>
                                                </CInputGroupAppend>
                                            </CInputGroup>
                                        </td>
                        }}
                    />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-end">
                    <CButton color="success" onClick={ handleSubmit }><i className="fas fa-check mr-2"></i> Terminer</CButton>
                </Modal.Footer>
            </Modal>
        </>
    );
}
 
export default GroupRateModal;
import React from 'react';
import { CButton, CDataTable, CFormGroup, CInput, CInputGroup, CInputGroupAppend, CInputGroupText, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import 'flatpickr/dist/themes/material_blue.css';
import { French } from "flatpickr/dist/l10n/fr.js";
import Flatpickr from 'react-flatpickr';
import { isDefinedAndNotVoid } from 'src/helpers/utils';

const Batches = ({ good, provision, setProvision, defaultBatch }) => {

    const handleAddBatch = () => {
        const newGoods = provision.goods.map(g => g.id !== good.id ? g : {...g, batches: [...good.batches, {...defaultBatch, quantity: getBatchQuantity(g), key: new Date().getTime()} ]} );
        setProvision({...provision, goods: newGoods});
    };

    const handleEndDateChange = (datetime, batch) => {
        if (isDefinedAndNotVoid(datetime)) {
            const newSelection = new Date(datetime[0].getFullYear(), datetime[0].getMonth(), datetime[0].getDate(), 9, 0, 0);
            const newGoods = provision.goods.map(g => g.id !== good.id ? g : {...g, batches: g.batches.map(b => b.key !== batch.key ? b : {...batch, endDate: newSelection})});
            setProvision({...provision, goods: newGoods});
        }
    };

    const handleQuantityChange = ({ currentTarget }) => {
        const newBatch = good.batches.find(b => b.key === parseInt(currentTarget.name));
        const newGoods = provision.goods.map(g => g.id !== good.id ? g : {...g, batches: g.batches.map(b => b.key !== newBatch.key ? b : {...newBatch, quantity: currentTarget.value})});
        setProvision({...provision, goods: newGoods});
    };

    const handleNumberChange = ({ currentTarget }) => {
        const newBatch = good.batches.find(b => b.key === parseInt(currentTarget.name));
        const newGoods = provision.goods.map(g => g.id !== good.id ? g : {...g, batches: g.batches.map(b => b.key !== newBatch.key ? b : {...newBatch, number: currentTarget.value})});
        setProvision({...provision, goods: newGoods});
    };

    const handleDelete = batch => {
        const newBatches = good.batches.filter(b => b.key !== parseInt(batch.key));
        const newGoods = provision.goods.map(g => g.id !== good.id ? g : {...good, batches: newBatches});
        setProvision({...provision, goods: newGoods});
    };

    const getBatchQuantity = good => {
        const batchQuantities = good.batches.reduce((sum, curr) => {
            return sum += parseFloat(curr.quantity);
        }, 0);
        const quantityToReturn = parseFloat(good.quantity) - batchQuantities;
        return quantityToReturn >= 0 ? quantityToReturn : 0;
    };

    return (
        <>
            <CDataTable
                items={ good.batches }
                fields={ ['N° de lot', 'Date de fin', 'Quantité'] }
                bordered
                hover
                scopedSlots = {{
                    'N° de lot':
                    child => <td>
                                <CInputGroup>
                                    <CInput
                                        name={ child.key }
                                        value={ child.number }
                                        onChange={ handleNumberChange }
                                        style={{ maxWidth: '180px'}}
                                    />
                                    <CInputGroupAppend>
                                        <CInputGroupText style={{ minWidth: '43px'}} onClick={ e => handleDelete(child) }><i className="fas fa-times"></i></CInputGroupText>
                                    </CInputGroupAppend>
                                </CInputGroup>
                            </td>
                    ,
                    'Date de fin':
                    child => <td>
                                <CFormGroup>
                                    <CInputGroup>
                                        <Flatpickr
                                            name={ child.key }
                                            value={ [child.endDate] }
                                            onChange={ e => handleEndDateChange(e, child) }
                                            className={`form-control`}
                                            options={{
                                                minDate: 'today',
                                                dateFormat: "d/m/Y",
                                                locale: French,
                                            }}
                                        />
                                    </CInputGroup>
                                </CFormGroup>
                                </td>
                    ,
                    'Quantité':
                    child => <td>
                                <CInputGroup>
                                    <CInput
                                        name={ child.key }
                                        type="number"
                                        value={ child.quantity }
                                        onChange={ handleQuantityChange }
                                        style={{ maxWidth: '180px'}}
                                    />
                                    <CInputGroupAppend>
                                        <CInputGroupText style={{ minWidth: '43px'}}>{ good.product.unit }</CInputGroupText>
                                    </CInputGroupAppend>
                                </CInputGroup>
                            </td>
                }}
            />
            <CRow className="mb-4 d-flex justify-content-center ml-1">
                <CButton size="sm" color="warning" onClick={ handleAddBatch }><CIcon name="cil-plus"/> Ajouter un lot</CButton>
            </CRow>
        </>
    );
}

export default Batches;
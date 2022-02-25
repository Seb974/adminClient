import React from 'react';
import { CDataTable, CInput, CInputGroup, CInputGroupAppend, CInputGroupText } from '@coreui/react';

const Traceabilities = ({ item, order, setOrder }) => {

    const handleQuantityChange = ({ currentTarget }) => {
        const newTraceability = item.traceabilities.find(b => b.id === parseInt(currentTarget.name));
        const newTraceabilities = item.traceabilities.map(t => t.id !== newTraceability.id ? t : {...newTraceability, quantity: currentTarget.value});
        updateTotalDelivered(newTraceabilities, item.id);
    };

    const updateTotalDelivered = (traceabilities, itemId) => {
        const total = traceabilities.reduce((sum, curr) => {
            return sum += parseFloat(curr.quantity);
        }, 0);
        const newItems = order.items.map(i => i.id === parseInt(itemId) ? ({...item, traceabilities, deliveredQty: total}) : i);
        setOrder({...order, items: newItems});
    };

    return (
        <>
            <CDataTable
                items={ item.traceabilities }
                fields={ ['N° de lot', 'Préparé', 'Livré'] }
                bordered
                hover
                scopedSlots = {{
                    'N° de lot':
                        child => <td>
                                    <CInputGroup>
                                        <CInput
                                            name={ child.id }
                                            value={ child.number }
                                            style={{ maxWidth: '180px'}}
                                            disabled={ true }
                                        />
                                    </CInputGroup>
                                </td>
                    ,
                    'Préparé':
                        child => <td>
                                    <CInputGroup>
                                        <CInput
                                            name={ child.id }
                                            type="number"
                                            value={ child.initialQty }
                                            style={{ maxWidth: '180px'}}
                                            disabled={ true }
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText style={{ minWidth: '43px'}}>
                                                { item.product.unit }
                                            </CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </td>
                    ,
                    'Livré':
                        child => <td>
                                    <CInputGroup>
                                        <CInput
                                            name={ child.id }
                                            type="number"
                                            value={ child.quantity }
                                            onChange={ handleQuantityChange }
                                            style={{ maxWidth: '180px'}}
                                        />
                                        <CInputGroupAppend>
                                            <CInputGroupText style={{ minWidth: '43px'}}>
                                                { item.product.unit }
                                            </CInputGroupText>
                                        </CInputGroupAppend>
                                    </CInputGroup>
                                </td>
                }}
            />
        </>
    );
}

export default Traceabilities;
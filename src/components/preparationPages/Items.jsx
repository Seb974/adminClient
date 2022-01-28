import React from 'react';
import { CButton, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Item from './Item';
import { isDefined } from 'src/helpers/utils';
import Packages from './Packages';

const Items = ({ items, setItems, defaultItem, editing, packages = null }) => {

    const handleItemAdd = () => {
        setItems([
            ...items, 
            {...defaultItem, count: items[items.length -1].count + 1}
        ])
    };

    const handleItemChange = item => {
        const filteredItemss = items.filter(option => parseInt(option.count) !== parseInt(item.count));
        setItems([...filteredItemss, item].sort((a, b) => (a.count > b.count) ? 1 : -1));
    };

    const handleItemDelete = ({currentTarget}) => {
        const item = items.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setItems(items.filter(element => parseInt(element.count) !== parseInt(item.count)));
    };

    return (
        <>
            <CRow className="mt-4">
                <CCol>Panier</CCol>
            </CRow>
            { items.map((item, index) => {
                return(
                    <>
                        <CRow className="text-center mt-4">
                            <CCol md="1">{""}</CCol>
                            <CCol md="10"><hr/></CCol>
                        </CRow>
                        <CRow>
                            <CCol md="1">{""}</CCol>
                            <CCol md="10">
                                <Item
                                    item={ item } 
                                    handleChange={ handleItemChange } 
                                    handleDelete={ handleItemDelete } 
                                    total={ items.length } 
                                    index={ index }
                                    editing={ editing }
                                />
                            </CCol>
                        </CRow>
                    </>
                );
            })}
            <CRow className="text-center mt-4">
                <CCol md="1">{""}</CCol>
                <CCol md="10"><hr/></CCol>
            </CRow>
            { isDefined(packages) && <Packages packages={ packages } /> }
            <CRow className="mt-4 d-flex justify-content-start ml-1">
                <CButton size="sm" color="warning" onClick={ handleItemAdd }><CIcon name="cil-plus"/> Ajouter un produit</CButton>
            </CRow>
        </>
    );
}
 
export default Items;
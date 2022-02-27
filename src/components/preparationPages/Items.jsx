import React, { useState } from 'react';
import { CButton, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Item from './Item';
import { isDefined } from 'src/helpers/utils';
import Packages from './Packages';
import { useEffect } from 'react';

const Items = ({ items, setItems, defaultItem, editing, packages = null, order = null, user = null }) => {

    const [userGroups, setUserGroups] = useState(["ROLE_USER"]);

    useEffect(() => {
        if (isDefined(user))
            setUserGroups(user.roles);
        else 
            setUserGroups(["ROLE_USER"]);
    }, [user]);

    const handleItemAdd = () => setItems([...items, {...defaultItem, count: items[items.length -1].count + 1}]);

    const handleItemChange = item => {
        const newItems = items.map(i => i.count === item.count ? item : i);
        setItems(newItems);
    };

    const handleItemDelete = ({currentTarget}) => {
        console.log(currentTarget.name);
        setItems(items.filter(i => i.count !== parseInt(currentTarget.name)));
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
                                    items={ items }
                                    setItems={ setItems }
                                    handleChange={ handleItemChange } 
                                    handleDelete={ handleItemDelete } 
                                    total={ items.length } 
                                    index={ index }
                                    editing={ editing }
                                    order={ order }
                                    user={ user }
                                    userGroups={ userGroups }
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
import React from 'react';
import { CButton, CCol, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Good from './Good';

const Goods = ({ provision, goods, setGoods, defaultGood, editing }) => {

    const handleGoodAdd = () => {
        setGoods([
            ...goods, 
            {...defaultGood, count: goods[goods.length -1].count + 1}
        ])
    };

    const handleGoodChange = good => {
        const filteredGoods = goods.filter(option => parseInt(option.count) !== parseInt(good.count));
        setGoods([...filteredGoods, good].sort((a, b) => (a.count > b.count) ? 1 : -1));
    };

    const handleGoodDelete = ({currentTarget}) => {
        const good = goods.find(option => parseInt(option.count) === parseInt(currentTarget.name));
        setGoods(goods.filter(element => parseInt(element.count) !== parseInt(good.count)));
    };

    return (
        <>
            <CRow className="mt-4">
                <CCol>Achats</CCol>
            </CRow>
            { goods.map((good, index) => {
                return(
                    <>
                        <CRow className="text-center mt-4">
                            <CCol md="1">{""}</CCol>
                            <CCol md="10"><hr/></CCol>
                        </CRow>
                        <CRow>
                            <CCol md="1">{""}</CCol>
                            <CCol md="10">
                                <Good
                                    provision={ provision }
                                    good={ good } 
                                    handleChange={ handleGoodChange } 
                                    handleDelete={ handleGoodDelete } 
                                    total={ goods.length } 
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
            <CRow className="mt-4 d-flex justify-content-start ml-1">
                <CButton size="sm" color="warning" onClick={ handleGoodAdd }><CIcon name="cil-plus"/> Ajouter un produit</CButton>
            </CRow>
        </>
    );
}
 
export default Goods;
import CIcon from '@coreui/icons-react';
import { CCol, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CLabel, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import Select from 'src/components/forms/Select';
import { isDefined } from 'src/helpers/utils';
import SupplierActions from 'src/services/SupplierActions';

const Supplier = ({ selectedSupplier, setSelectedSupplier, loading, setLoading, addToast, failToast }) => {

    const [suppliers, setSuppliers] = useState([]);

    useEffect(() => fetchSuppliers(), []);

    const fetchSuppliers = () => {
        setLoading(true);
        SupplierActions
            .findAll()
            .then(response => {
                setSuppliers(response);
                setSelectedSupplier(response[0]);
            })
            .catch(error => {
                setLoading(false);
                addToast(failToast);
            });
    };

    const handleSupplierChange = ({ currentTarget }) => {
        const newSupplier = suppliers.find(supplier => supplier.id === parseInt(currentTarget.value));
        setSelectedSupplier(newSupplier);
    };

    const handleSupplierInfosChange = ({ currentTarget }) => setSelectedSupplier({...selectedSupplier, [currentTarget.name]: currentTarget.value });

    return (
        <>
            <hr/>
            <CRow className="mt-2">
                <CCol xs="12" lg="12" className="mt-4">
                    <Select className="mr-2" name="supplier" label="Fournisseur" value={ isDefined(selectedSupplier) ? selectedSupplier.id : 0 } onChange={ handleSupplierChange }>
                        { suppliers.map(supplier => <option key={ supplier.id } value={ supplier.id }>{ supplier.name }</option>) }
                    </Select>
                </CCol>
            </CRow>
            <CRow className="mb-4">
                <CCol xs="12" lg="6">
                    <CLabel>Téléphone</CLabel>
                    <CInputGroup>
                        <CInputGroupPrepend>
                            <CInputGroupText style={{ minWidth: '43px'}}><CIcon name="cil-phone"/></CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                            name="phone"
                            value={ isDefined(selectedSupplier) && isDefined(selectedSupplier.phone) && selectedSupplier.phone.length > 0 ? (parseInt(selectedSupplier.id) !== -1 ? selectedSupplier.phone : '-') : "" }
                            onChange={ handleSupplierInfosChange }
                        />
                    </CInputGroup>
                </CCol>
                <CCol xs="12" lg="6" >
                    <CLabel>Email(s) <small className="ml-3"><i>séparation par ";"</i></small></CLabel>
                    <CInputGroup>
                        <CInputGroupPrepend>
                            <CInputGroupText style={{ minWidth: '43px'}}>@</CInputGroupText>
                        </CInputGroupPrepend>
                        <CInput
                            name="email"
                            value={ isDefined(selectedSupplier) && isDefined(selectedSupplier.email) ? (parseInt(selectedSupplier.id) !== -1 ? selectedSupplier.email : "-") : "" }
                            onChange={ handleSupplierInfosChange }
                        />
                    </CInputGroup>
                </CCol>
            </CRow>
            <CRow className="my-4">
                { isDefined(selectedSupplier) && isDefined(selectedSupplier.provisionMin) && <CCol xs="12" lg="6"><CLabel className="font-italic font-weight-bold">Minimum de commande : { selectedSupplier.provisionMin.toFixed(2) } €</CLabel></CCol> }
                { isDefined(selectedSupplier) && isDefined(selectedSupplier.deliveryMin) && <CCol xs="12" lg="6"><CLabel className="font-italic font-weight-bold">Minimum pour livraison : { selectedSupplier.deliveryMin.toFixed(2) } €</CLabel></CCol> }
            </CRow>
            <hr/>
        </>
    );
}

export default Supplier;
import React from 'react';
import { CButton, CCol, CRow } from '@coreui/react';
import { isDefinedAndNotVoid } from 'src/helpers/utils';
import PackageList from './packageList';

const Packages = ({ packages }) => {

    return !isDefinedAndNotVoid(packages) ? <></> : (
        <>
        { packages.map((p, i) => {
            return (
                <>
                {/* <CRow className="text-center mt-4">
                    <CCol md="1">{""}</CCol>
                    <CCol md="10"><hr/></CCol>
                </CRow> */}
                <CRow>
                    <CCol md="1">{""}</CCol>
                    <CCol md="11">
                        <PackageList _package={ p } total={ packages.length } index={ i } orderView={ true }/>
                    </CCol>
                </CRow>
            </>
            )
         })
        }
        </>
     );
}
 
export default Packages;
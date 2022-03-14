import React from 'react';
import { CCol, CRow } from '@coreui/react';
import { isDefinedAndNotVoid } from 'src/helpers/utils';
import PackageList from './packageList';

const Packages = ({ packages }) => {

    return !isDefinedAndNotVoid(packages) ? <></> : (
        <>
        { packages.map((p, i) => {
            return (
                <>
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
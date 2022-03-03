import React, { useEffect, useState } from 'react';
import { Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import TouringActions from 'src/services/TouringActions';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';
import DeliveryInformations from 'src/components/deliveryNotes/deliveryInformations';

const styles = StyleSheet.create({
    viewer: {
        height: '100vh',
        width: '100vw'
    },
    document: {
        height: '100vh',
        width: '100vw'
    },
    page: {
      backgroundColor: '#E4E4E4',
      width: 100,
      height: 100
    },
    header: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 15
    },
    society: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        width: 100,
        height: 100,
        textAlign: 'left'
    },
    client: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        width: 100,
        height: 100,
        textAlign: 'right'
    },
    orderNumber: {
        marginLeft: 10,
        marginTop: 30,
        paddingLeft: 10,
        textAlign: 'left'
    },
    date: {
        marginLeft: 10,
        marginTop: 10,
        paddingLeft: 10,
        textAlign: 'left'
    },
    text: {
        marginLeft: 12,
        marginBottom: 6,
        fontSize: 11,
    },
    h3: {
        marginLeft: 12,
        marginBottom: 6,
        fontSize: 13,
        fontWeight: 'extrabold'
    },
    small: {
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 6,
        fontSize: 8,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'left',
        // color: 'grey'
    }
});

const DeliveryNote = ({ match }) => {

    const { id = "new" } = match.params;
    const maxPerPage = 15;
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (id !== "new")
            fetchTouring(id);
    }, []);
    
    const fetchTouring = id => {
        TouringActions
            .find(id)
            .then(response => {
                setOrders(response.orderEntities);
                console.log(response.orderEntities);
            })
            .catch(error => console.log(error));
    };

    return !isDefinedAndNotVoid(orders) ? <></> : (
        <PDFViewer id="deliveryViewer" style={ styles.viewer }>
            <Document style={ styles.viewer }>
                { orders.map(order => <DeliveryInformations order={ order } ordersLength={ order.items.length } maxPerPage={ maxPerPage } packagesLength={ isDefined(order.packages) ? order.packages.length : 0 }/> )}
            </Document>
        </PDFViewer>
    );
}

export default DeliveryNote;
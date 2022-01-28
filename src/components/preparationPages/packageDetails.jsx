import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { isDefinedAndNotVoid } from 'src/helpers/utils';
import PackageTable from './packageTable';

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
    pageNumber: {
        textAlign: 'left',
        fontSize: 13,
        fontWeight: 'extrabold',
        marginLeft: 10,
        marginTop: 10,
        paddingLeft: 10,
        // marginRight: 30
    },
    pageText: {
        marginLeft: 12,
        marginBottom: 6,
        fontSize: 9,
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
    h4: {
        marginLeft: 12,
        marginBottom: 6,
        fontSize: 11,
        fontWeight: 'extrabold'
    },
    small: {
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 6,
        fontSize: 8,
    },
    title: {
        marginTop: 10,
        fontSize: 18,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        fontSize: 10,
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'left',
    }
});

const PackageDetails = ({order, packages }) => {

    return (
        <Page size="A4" style={ styles.page }>
            <View>
                <Text style={styles.title}>PLAN DE COLISAGE</Text>
            </View>
            <View style={ styles.orderNumber }>
                <Text style={styles.h3}>
                    { "Commande N°" + order.id.toString().padStart(10, '0') + " du " + new Date(order.deliveryDate).toLocaleDateString() + " : " }
                </Text>
            </View>
            {/* <View style={ styles.date }>
                <Text style={styles.text}>{"Le " + new Date(order.deliveryDate).toLocaleDateString() + ',' }</Text>
            </View> */}
            {   packages.map((p,i) => {
                return (
                    <View key={ i }>
                        <View style={ styles.pageNumber }>
                            <Text style={styles.h4}>{ "Colis N°" + (i + 1) + " - " + p.name }</Text>
                        </View>
                        <PackageTable _package={ p }/>
                    </View>
                )})
            }
        </Page>
    )
}
 
export default PackageDetails;
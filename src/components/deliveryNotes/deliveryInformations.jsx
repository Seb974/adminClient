import React from 'react';
import DeliveryTable from 'src/components/deliveryNotes/deliveryTable';
import { Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { isDefinedAndNotVoid } from 'src/helpers/utils';

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
      position: 'absolute',
      backgroundColor: '#E4E4E4',
      width: 100,
      height: 100
    },
    background: {
        position: 'relative',
        top: 180,
        zIndex: -20,
    },
    body: {
        position: 'absolute',
        top: 0,
        margin: 'auto'
    },
    header: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 15
    },
    society: {
        marginLeft: 10,
        paddingLeft: 10,
        flexGrow: 1,
        width: 150,
        height: 150,
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column'
    },
    societyAddress: {
        marginTop: 0,
        flexGrow: 1,
        textAlign: 'left',
    },
    client: {
        margin: 10,
        marginRight: 80,
        padding: 10,
        flexGrow: 1,
        width: 90,
        height: 100,
        textAlign: 'right'
    },
    pageNumber: {
        textAlign: 'right',
        fontSize: 8,
        marginRight: 90,
        marginLeft: 'auto'
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
    small: {
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 6,
        fontSize: 8,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    footer: {
        position: 'absolute',
        fontSize: 10,
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'left',
        // color: 'grey'
    }
});

const DeliveryInformations = ({order, ordersLength, maxPerPage, packagesLength = 0 }) => {

    const totalPages = Math.ceil((ordersLength + packagesLength) / maxPerPage);
    const pages = [...Array(totalPages).keys()];
    const invoicedElements = packagesLength === 0 ? 
        [...order.items.map(i => ({...i, isPackage: false}))] : 
        [...order.items.map(i => ({...i, isPackage: false})), ...order.packages.map(p => ({...p, isPackage: true}))];

    return (
        pages.map((page, i) => {

            const itemsToDisplay = invoicedElements.slice((i * maxPerPage), ((i + 1) * maxPerPage));
            const orderPages = Math.ceil(invoicedElements.length / maxPerPage);

            return !isDefinedAndNotVoid(itemsToDisplay) ? <></> : (
                <Page size="A4" style={ styles.page }>
                    <Image src="/assets/img/logo/logo_transparent.png" style={styles.background} />
                    <View style={ styles.body }>
                        <View style={styles.header}>
                                <View style={ styles.society }>
                                    <Image src="/assets/img/logo/logo_fp_4.png" style={{ width: '120px', marginLeft: 5, marginTop: -10, marginBottom: -15}} />
                                    <View >
                                        <Text style={styles.text}>19 chemin Raphaël</Text>
                                        <Text style={styles.text}>97410 SAINT PIERRE</Text>
                                        <Text style={styles.small}>N° SIRET : 832719181 00014</Text>
                                    </View>
                                </View>
                            <View style={ styles.client }>
                                <Text style={{...styles.h3, marginBottom: 16, fontSize: 15}}>{ order.name }</Text>
                                <Text style={styles.text}>{ order.metas.address }</Text>
                                <Text style={styles.text}>{ order.metas.address2 }</Text>
                                <Text style={styles.text}>{ "Tel : " + order.metas.phone }</Text>
                            </View>
                        </View>
                        <View>
                            <Text style={styles.title}>BON DE LIVRAISON</Text>
                        </View>
                        <View style={ styles.orderNumber }>
                            <Text style={styles.h3}>{"Commande N°" + order.id.toString().padStart(10, '0') }</Text>
                        </View>
                        <View style={ styles.date }>
                            <Text style={styles.text}>{"Le " + new Date(order.deliveryDate).toLocaleDateString() + ',' }</Text>
                        </View>
                        <View style={ styles.pageNumber }>
                            <Text style={styles.pageText}>Page { i + 1 } sur { orderPages }</Text>
                        </View>

                        <DeliveryTable order={ order } items={ itemsToDisplay }/>
            
                    </View>
                        <View style={ styles.footer }>
                            <Text style={styles.small}>
                                En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal sera exigible (Décret 2009-138 du 9 février 2009), ainsi qu'une indémnité forfaitaire pour frais de
                                recouvrement d'un montant minimum de 40 euros pour les professionnels (Décret 2012-1115 du 9 octobre 2012).
                            </Text>
                        </View>
                </Page>
            )
        })
    );
}
 
export default DeliveryInformations;
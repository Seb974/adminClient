import React from 'react';
import DeliveryTable from 'src/components/deliveryNotes/deliveryTable';
import { Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { isDefined, isDefinedAndNotVoid } from 'src/helpers/utils';

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
        opacity: 0.17
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
    }
});

const DeliveryInformations = ({order, ordersLength, maxPerPage, packagesLength = 0, platform = null, activeSellers = [] }) => {

    const sellers = order.items.map(i => i.product.seller).reduce((arr, curr) => {
        return arr = arr.find(s => s.id === curr.id) === undefined ? [...arr, curr] : arr;
    }, []);

    const getItemsSellers = sellers => {
        const dbSellers = sellers.map(s => activeSellers.find(seller => seller.id === s.id)).filter(s => isDefined(s));
        const separatedSellers = dbSellers.filter(s => s.hasSeparatedNote);
        const separatedItems = separatedSellers.map(s => {
            const relatedItems = order.items.filter(i => i.product.seller.id === s.id)
                                            .map(i => ({...i, isPackage: false}));
            return { seller: s, items: relatedItems };
        });
        
        const linkedSellers = dbSellers.filter(s => !isDefined(s.hasSeparatedNote) || !s.hasSeparatedNote).map(s => s.id);
        const linkedItems = order.items.filter(i => linkedSellers.includes(i.product.seller.id))
                                       .map(i => ({...i, isPackage: false}));

        const platformItems = isDefined(order.packages) ? [...linkedItems, ...order.packages.map(p => ({...p, isPackage: true}))] : linkedItems;

        return [...separatedItems, { platform: platform, items: platformItems}];
    };

    const itemsSellers = getItemsSellers(sellers);


    const getPages = sellersItems => {
        let pageItems = [];
        sellersItems.map((sellerItems, i) => {
            if (sellerItems.items.length <= maxPerPage) {
                pageItems = [...pageItems, {...sellerItems, page: i }];
            } else {
                let j = 0;
                while (j * maxPerPage < sellerItems.items.length) {
                    pageItems = [...pageItems, {...sellerItems, items: sellerItems.items.slice((j * maxPerPage), ((j + 1) * maxPerPage)), page: i + j}];
                    j++;
                }
            }
        });
        return pageItems;
    };

    const pages = getPages(itemsSellers);

    const getEntityAddress = (entity) => {
        if (isDefined(entity) && isDefined(entity.metas)) {
            const address = entity.metas.address;
            return isDefined(address) && address.length > 0 ? (address.split(','))[0] :  "";
        }
        return "";
    };

    const getEntityCity = (entity) => {
        if (isDefined(entity) && isDefined(entity.metas)) {
            const zipcode = entity.metas.zipcode;
            const city = entity.metas.city;
            return isDefined(zipcode) && isDefined(city) ? `${zipcode} - ${city}` : "";
        }
        return "";
    };

    const getEntitySiret = (entity) => {
        return isDefined(entity) && isDefined(entity.siret) ? `N° SIRET : ${entity.siret}` : "";
    };

    return !isDefined(platform) || !isDefinedAndNotVoid(pages) ? <></> : (
        pages.map((page, i) => {
            return (
                <Page size="A4" style={ styles.page }>
                    { !isDefined(page.seller) && isDefined(platform) && isDefinedAndNotVoid(platform.logos) && isDefined(platform.logos.find(l => l.type === "LOGO_FULL_DARK")) &&
                        <Image 
                            src={ (platform.logos.find(l => l.type === "LOGO_FULL_DARK")).image.imgPath }
                            style={styles.background}
                            loading="lazy"
                            alt=""
                        />
                    }
                    { isDefined(page.seller) && isDefinedAndNotVoid(page.seller.logos) && isDefined(page.seller.logos.find(l => l.type === "LOGO_FULL_DARK")) &&
                        <Image 
                            src={ (page.seller.logos.find(l => l.type === "LOGO_FULL_DARK")).image.imgPath }
                            style={styles.background}
                            loading="lazy"
                            alt=""
                        />
                    }
                    <View style={ styles.body }>
                        <View style={styles.header}>
                                <View style={ styles.society }>
                                    { !isDefined(page.seller) && isDefined(platform) && isDefinedAndNotVoid(platform.logos) && isDefined(platform.logos.find(l => l.type === "LOGO_STRETCHED_DARK")) &&
                                        <Image 
                                            src={ (platform.logos.find(l => l.type === "LOGO_STRETCHED_DARK")).image.imgPath }
                                            style={{ width: '120px', marginLeft: 5, marginTop: -10, marginBottom: 10}}
                                            loading="lazy"
                                            alt=""
                                        />
                                    }
                                    { isDefined(page.seller) && isDefinedAndNotVoid(page.seller.logos) && isDefined(page.seller.logos.find(l => l.type === "LOGO_STRETCHED_DARK")) &&
                                        <Image 
                                            src={ (page.seller.logos.find(l => l.type === "LOGO_STRETCHED_DARK")).image.imgPath }
                                            style={{ width: '120px', marginLeft: 5, marginTop: -10, marginBottom: 10}}
                                            loading="lazy"
                                            alt=""
                                        />
                                    }
                                    <View >
                                        <Text style={styles.text}>{ getEntityAddress(page.page + 1 === pages.length || !isDefined(page.seller) ? platform : page.seller) }</Text>
                                        <Text style={styles.text}>{ getEntityCity(page.page + 1 === pages.length || !isDefined(page.seller) ? platform : page.seller) }</Text>
                                        <Text style={styles.small}>{ getEntitySiret(page.page + 1 === pages.length || !isDefined(page.seller) ? platform : page.seller) }</Text>
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
                            <Text style={styles.pageText}>Page { i + 1 } sur { pages.length }</Text>
                        </View>

                        <DeliveryTable order={ order } items={ page.items } currentPage={ i } numberOfPages={ pages.length }/>
            
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
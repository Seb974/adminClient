import React, { useContext, useEffect, useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardCvcElement, CardExpiryElement } from '@stripe/react-stripe-js';
import Modal from 'react-bootstrap/Modal';
import api from '../../config/api';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import 'src/assets/css/payment-form.css';
import { Spinner } from 'react-bootstrap';
import { isDefined } from '../../helpers/utils';
import AuthContext from 'src/contexts/AuthContext';
import AuthActions from 'src/services/AuthActions';
import { cardStyle, updateError, paymentConnexionError } from '../../helpers/checkout';

const PaymentForm = ({ name, available, bills, orders, setOrders }) => {

    const stripe = useStripe();
    const elements = useElements();
    const [show, setShow] = useState(false);
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const [succeeded, setSucceeded] = useState(false);
    const [error, setError] = useState(null);
    const [inputError, setInputError] = useState(null);
    const [processing, setProcessing] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (show)
            createPayment();
    }, [show]);

    const handleShow = () => setShow(true);

    const handleClose = () => {
        if (!processing && !loading) {
            setShow(false);
            setError(null);
            setInputError(null);
            setLoading(false);
            setProcessing(false);
        }
    };

    const handleChange = (e) => {
        setDisabled(e.empty);
        setInputError(e.error ? e.error.message : "");
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!stripe || !elements) {
            setError(paymentConnexionError);
            return ;
        }
        confirmPayment();
    };

    const handleSuccess = () => setShow(false);

    const handleRetry = () => createPayment();

    const createPayment = () => {
        setLoading(true);
        api.post('/api/bills-payment', { bills: bills })
            .then(({data}) => {
                setClientSecret(data.clientSecret);
                setAmount(data.amount / 100 );
                setError(null);
                setInputError(null);
                setLoading(false);
            })
            .catch(error => setError(paymentConnexionError));
    };

    const confirmPayment = ( ) => {
        setProcessing(true);
        stripe
            .confirmCardPayment(clientSecret, { payment_method: { card: elements.getElement(CardNumberElement) } })
            .then(response => {
                isDefined(response.error) ? handleError(response.error.message) : handlePaymentSuccess();
            });
    };

    const handleError = (errorMessage = updateError) => {
        setError(errorMessage);
        setProcessing(false);
    };

    const handlePaymentSuccess = () => {
        const paymentId = clientSecret.substring(3, clientSecret.indexOf('_', 3));
        api.post('/api/accounting/payments', { bills: bills, paymentId: paymentId })
            .then(response => {
                if (isDefined(response.error)) {
                    const paymentError = updateError + "\nTrace de l'erreur : \n" + response.error;
                    handleError(paymentError);
                } else {
                    updateSucceededOrders();
                    setError(null);
                    setInputError(null);
                    setProcessing(false);
                    setSucceeded(true);
                }
            })
    };

    const updateSucceededOrders = () => {
        const newOrders = orders.map(o => bills.find(b => b.id === o.id) === undefined ? o : {...o, paid_date: getFormattedDate(), selected: false});
        setOrders(newOrders);
    };

    const getFormattedDate = () => {
        const now = new Date();
        return '' + now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    }

    return (
        <>
            <Button href="#" onClick={ handleShow } disabled={ !available }><i className="fas fa-credit-card mr-2"></i>{ name }</Button>
            <Modal show={ show } onHide={ handleClose } backdrop="static" size="md" aria-labelledby="contained-modal-title-vcenter" centered id="payment-modal">
                <Modal.Header closeButton={ !processing && !loading }>
                    <Modal.Title>{loading ? "Paiement" : "Paiement de " + amount.toFixed(2).replace('.', ',') + " €"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    { loading ? 
                        <div className="row">
                            <div className="col-md-12 text-center">
                                <Spinner animation="border" variant="danger"/>
                            </div>
                        </div>
                    : !succeeded && !error ? 
                        <Form id="payment-form" onSubmit={ handleSubmit } className="d-flex flex-column justify-content-center">
                            <label>
                                <span className="ml-2">Numéro de carte</span>
                                <CardNumberElement options={ cardStyle } onChange={ handleChange }/>
                            </label>
                            <label>
                                <span className="ml-2">Date d'expiration</span>
                                <CardExpiryElement options={ cardStyle } onChange={ handleChange }/>
                            </label>
                            <label>
                                <span className="ml-2">CVC</span>
                                <CardCvcElement options={ cardStyle } onChange={ handleChange }/>
                            </label>
                            { !inputError ? <div className="mb-3">{ " " }</div> :
                                <div className="card-error d-flex flex-column align-items-start mb-3 text-danger" role="alert">{ inputError }</div> 
                            }
                            <Form.Row>
                                <Form.Group as={Col} md={12} className="text-center" >
                                    { processing ? <Spinner animation="border" variant="warning" /> :
                                        <Button id="submit" variant="primary" type="submit" disabled={ !stripe || processing || disabled || succeeded } size="lg">
                                            <span id="button-text">PAYER</span>
                                        </Button>
                                    }
                                </Form.Group>
                            </Form.Row>
                        </Form>
                    : succeeded ?
                        <div className="result-message d-flex flex-column align-items-center">
                            <h3><i className="fas fa-check-circle text-success mr-2"></i>Paiement accepté</h3>
                            <br/>
                            <p><Button variant="secondary" onClick={ handleSuccess }>Fermer</Button></p>
                        </div>
                    : error ? 
                        <div className="card-error d-flex flex-column align-items-center" role="alert">
                            <p>{ error }</p>
                            <br/>
                                <p>{ error === updateError ? 
                                    <Button variant="secondary" onClick={ handleClose }>J'ai compris</Button>
                                :
                                    <Button variant="secondary" onClick={ handleRetry }>Réessayer</Button>
                                }</p>
                        </div> 
                    : <></> 
                    }
                </Modal.Body>
                <Modal.Footer>
                    <img src="/assets/img/icon-img/stripe-logo.png" alt="stripe-logo"/>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default PaymentForm;
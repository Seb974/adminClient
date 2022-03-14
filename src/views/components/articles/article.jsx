import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ArticleActions from 'src/services/ArticleActions';
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CInput, CInvalidFeedback, CLabel, CRow, CSwitch, CTextarea } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import Image from 'src/components/forms/image';
import ReactQuill from 'react-quill';
import 'src/scss/TextEditors.scss';
import api from 'src/config/api';

const Article = ({ match, history }) => {


    const quill = useRef(null);
    const { id = "new" } = match.params;
    const defaultError = {title: "", image: "", summary: "", content: "", visible: ""};

    const [text, setText] = useState("");
    const [editing, setEditing] = useState(false);
    const [article, setArticle] = useState({ title: "", summary: "", image: null, content: "", visible: true });
    const [errors, setErrors] = useState(defaultError);

    useEffect(() => fetchArticle(id), []);

    useEffect(() => fetchArticle(id), [id]);

    const handleChange = ({ currentTarget }) => setArticle({...article, [currentTarget.name]: currentTarget.value});

    const fetchArticle = id => {
        if (id !== "new") {
            setEditing(true);
            ArticleActions.find(id)
                .then(response => {
                    setArticle(response);
                    setText(response.content);
                })
                .catch(error => history.replace("/components/articles"));
        }
    };

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
  
        input.onchange = async () => {
            const range = quill.current.getEditor().getSelection();
            const res = await ArticleActions.createImage(input.files[0]);
            quill.current.editor.insertEmbed(range.index, 'image', `${ api.API_DOMAIN }${ res.contentUrl }`);
            quill.current.editor.setSelection(range.index + 1);
        };
    }

    const getArticleWithImage = async () => {
        let articleWithImage = {...article};
        if (article.image && !article.image.filePath) {
            const image = await ArticleActions.createImage(article.image);
            articleWithImage = {...articleWithImage, image: image['@id']}
        }
        return articleWithImage;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const articleWithImage = await getArticleWithImage();
        const articleToWrite = {...articleWithImage, content: text, image: typeof articleWithImage.image === 'string' ? articleWithImage.image : articleWithImage.image['@id']};
        const request = !editing ? ArticleActions.create(articleToWrite) : ArticleActions.update(id, articleToWrite);
        request
            .then(response => {
                setErrors(defaultError);
                history.replace("/components/articles");
            })
            .catch( ({ response }) => {
                if (response) {
                    const { violations } = response.data;
                    if (violations) {
                        const apiErrors = {};
                        violations.forEach(({propertyPath, message}) => {
                            apiErrors[propertyPath] = message;
                        });
                        setErrors(apiErrors);
                    }
                }
            });
    };

    const handleVisibilityChange = ({ currentTarget }) => setArticle({...article, visible: !article.visible});

    const modules = useMemo(() => ({
        toolbar: {
          container: [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['link', 'image'],
              ['clean']
          ],
          handlers: {
              image: imageHandler
          }
        }
      }), []);

    return (
        <CRow>
            <CCol xs="12" sm="12">
                <CCard>
                    <CCardHeader>
                        <h3>Créer un article</h3>
                    </CCardHeader>
                    <CCardBody>
                        <CForm onSubmit={ handleSubmit }>
                            <CRow>
                                <CCol xs="12" sm="12" md="12">
                                    <CFormGroup>
                                        <CLabel htmlFor="name">Titre</CLabel>
                                        <CInput
                                            id="title"
                                            name="title"
                                            value={ article.title }
                                            onChange={ handleChange }
                                            placeholder="Titre de l'article"
                                            invalid={ errors.title.length > 0 } 
                                        />
                                        <CInvalidFeedback>{ errors.title }</CInvalidFeedback>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <Image entity={ article } setEntity={ setArticle } isLandscape={ true } sizes="750 x 440"/>
                            <CFormGroup row className="mb-4">
                                <CCol xs="12" md="12">
                                    <CLabel htmlFor="textarea-input">Résumé</CLabel>
                                    <CTextarea name="summary" id="summary" rows="5" placeholder="Résumé..." onChange={ handleChange } value={ article.summary }/>
                                </CCol>
                            </CFormGroup>
                            <CRow>
                                <CCol xs="12" md="12">
                                    <CLabel htmlFor="textarea-input">Contenu</CLabel>
                                    <ReactQuill value={ text } modules={ modules } onChange={ setText } theme="snow" ref={ quill }/>
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol xs="12" sm="6" className="mt-4">
                                    <CFormGroup row className="mb-0 ml-1 d-flex align-items-end">
                                        <CCol xs="3" sm="2" md="3">
                                            <CSwitch name="visible" className="mr-1" color="dark" shape="pill" variant="opposite" checked={ article.visible } onChange={ handleVisibilityChange }/>
                                        </CCol>
                                        <CCol tag="label" xs="9" sm="10" md="9" className="col-form-label">Article publié</CCol>
                                    </CFormGroup>
                                </CCol>
                            </CRow>
                            <hr className="mt-5"/>
                            <CRow className="mt-4 d-flex justify-content-center">
                                <CButton type="submit" size="sm" color="success"><CIcon name="cil-save"/> Enregistrer</CButton>
                            </CRow>
                        </CForm>
                    </CCardBody>
                    <CCardFooter>
                        <Link to="/components/articles" className="btn btn-link">Retour à la liste</Link>
                    </CCardFooter>
                </CCard>
            </CCol>
        </CRow>
    );
}
 
export default Article;
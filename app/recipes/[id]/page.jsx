'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRecipe, deleteRecipe, updateRecipe } from '@/app/services/recipeService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUtensils, faLeaf, faShare } from '@fortawesome/free-solid-svg-icons';
import RecipeModal from '@/app/components/RecipeModal';
import Image from 'next/image';
import style from '@/app/styles/recipeDetail.module.css';
import modalStyle from '@/app/styles/recipeModal.module.css';

export default function RecipeDetail() {
    const router = useRouter();
    const { id } = useParams();
    const inputPhotoRef = useRef(null);
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formMode, setFormMode] = useState('edit');
    const [formData, setFormData] = useState({
        title: '',
        categories: [],
        fit: true,
        ingredients: [],
        instructions: '',
        image: null
    })
    const [modalOpen, setModalOpen] = useState(false);
    const [updatingPhoto, setUpdatingPhoto] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({})

    const handleEditModal = () => {
        setFormData({
            title: recipe.title || '',
            categories: recipe.categories || [],
            fit: recipe.fit,
            ingredients: (recipe.ingredients || []).join(', '),
            instructions: recipe.instructions || '',
            image: recipe.imageUrl || null
        });

        setFormMode('edit');
        setModalOpen(true);
    };

    const handleDelete = async (recipeId) => {
        const confirmation = window.confirm(
            '¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer.'
        );

        if (!confirmation) return;

        try {
            await deleteRecipe(recipeId);
            alert('Receta eliminada exitosamente');

            router.push('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShare = () => {
        // Logic to share recipe
    };

    const refreshRecipe = async () => {
        try {
            const data = await getRecipe(id);
            setRecipe(data);
        } catch (err) {
            setError('No se pudo actualizar la receta');
        }
    };

    const validateFields = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
        if (!formData.ingredients.trim()) newErrors.ingredients = 'Los ingredientes son obligatorios';
        if (!formData.instructions.trim()) newErrors.instructions = 'Las instrucciones son obligatorias';
        if (formData.categories.length === 0) newErrors.categories = 'Seleccioná al menos una categoría';
        return newErrors;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (formData.image && typeof formData.image !== 'string') {
                URL.revokeObjectURL(formData.image);
            }
            setFormData(prev => ({ ...prev, image: file }));
        }
    }

    const handleUpdateOnlyImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUpdatingPhoto(true);
        setError(null);

        try {
            const completeData = {
                id,
                title: recipe.title,
                categories: recipe.categories,
                fit: recipe.fit,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                image: file
            };

            await updateRecipe(completeData, id);
            await refreshRecipe();

        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingPhoto(false);
        }
    };

    const handleUpdateRecipe = async (e) => {
        e.preventDefault();
        if (saving) return;

        const errorsDetected = validateFields();
        if (Object.keys(errorsDetected).length > 0) {
            setErrors(errorsDetected);
            setError(null);
            return;
        }

        setErrors({});
        setError(null);
        setSaving(true);

        try {
            const payload = {
                ...formData,
                ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
            };
            await updateRecipe({ ...payload, id }, id);
            await refreshRecipe();
            setModalOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        const fetchRecipe = async () => {
            try {
                const data = await getRecipe(id);
                setRecipe(data);
            } catch (error) {
                setError('No se pudo cargar la receta');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipe();
    }, [id]);

    if (loading) return <p className={style.loading}>Cargando receta...</p>;
    if (error) return <p className={style.error}>{error}</p>;

    // Transform instructions to respect jumps or numbers
    const formattedInstructions = recipe.instructions
        ?.replace(/(\d+\)|\d+\.)/g, '\n$1') // insert line break before each numbered step
        .split('\n')
        .filter(line => line.trim() !== '');

    return (
        <main>
            <div className={style.recipeDetailContainer}>
                <h1 className={style.recipeTitle}>{recipe.title}</h1>
                <div className={style.recipeMeta}>
                    <p><FontAwesomeIcon icon={faUtensils} />   {(recipe.categories || []).join(', ')}</p>
                    <p><FontAwesomeIcon icon={faLeaf} /> Fit: {recipe.fit ? 'Sí' : 'No'}</p>
                </div>
                <div className={style.recipeContentContainer}>
                    <div className={style.photoContainer}>
                        {recipe.imageUrl ? (
                            <img
                                src={recipe.imageUrl}
                                alt={recipe.title}
                                className={style.recipeImage}
                            />
                        ) : (
                            <div className={style.noImage}>
                                <span>📷</span>
                            </div>
                        )}

                        <input
                            ref={inputPhotoRef}
                            type="file"
                            accept="image/*"
                            onChange={handleUpdateOnlyImage}
                            style={{ display: 'none' }}
                        />

                        <button
                            type="button"
                            onClick={() => inputPhotoRef.current?.click()}
                            disabled={updatingPhoto}
                            className={style.updatePhotoButton}
                        >
                            {updatingPhoto ? "Actualizando..." : "Actualizar Foto"}
                        </button>
                    </div>

                    <div className={style.recipeInfo}>
                        <p className={style.recipeIngredientsTitle}>Ingredientes</p>
                        <ul className={style.recipeIngredientsList}>
                            {recipe.ingredients.map((i, index) => <li key={index}>{i}</li>)}
                        </ul>
                    </div>
                </div>

                <div className={style.recipeInstructions}>
                    <p className={style.recipeInstructionsTitle}>Instrucciones</p>
                    {formattedInstructions.map((line, index) => (
                        <p key={index}>{line.trim()}</p>
                    ))}
                </div>

                <div className={style.buttonsContainer}>
                    <button className={style.recipeDetailButton} onClick={handleEditModal}>
                        <FontAwesomeIcon icon={faEdit} /> Editar
                    </button>
                    <button
                        className={style.recipeDetailButton}
                        onClick={() => handleDelete(recipe.id)}
                    >
                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                    </button>
                    <button className={style.recipeDetailButton} onClick={handleShare}>
                        <FontAwesomeIcon icon={faShare} /> Compartir
                    </button>
                </div>
            </div>
            <RecipeModal
                modalOpen={modalOpen}
                modalClose={() => setModalOpen(false)}
            >
                <>
                    <header className={modalStyle.modalHeader}>
                        <h3>{formMode === 'edit' ? 'Actualizar receta' : 'Agregar receta'}</h3>
                    </header>

                    <div className={modalStyle.imageInputContainer}>
                        {formData.image && (
                            <Image
                                src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)}
                                width={200}
                                height={200}
                                alt={formData.title || 'Imagen de la receta'}
                                className={modalStyle.imagePreview}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={modalStyle.imageInput}
                        />
                    </div>

                    {/* Title */}
                    <section className={modalStyle.inputSection}>
                        <label htmlFor="title" className={modalStyle.label}>Titulo:</label>
                        <input
                            type="text"
                            placeholder="Titulo"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className={modalStyle.input}
                        />
                        {errors.title && <p className={modalStyle.error}>{errors.title}</p>}
                    </section>

                    <div className={modalStyle.formContainer}>
                        {/* Category */}
                        <fieldset className={modalStyle.fieldset}>
                            <legend className={modalStyle.legend}>Categorías:</legend>
                            {['DESAYUNO', 'BRUNCH', 'ALMUERZO', 'MERIENDA', 'CENA', 'POSTRE'].map(cat => (
                                <label key={cat} className={modalStyle.radioLabel}>
                                    <input
                                        type="checkbox"
                                        value={cat}
                                        checked={formData.categories.includes(cat)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData(prev => ({ ...prev, categories: [...prev.categories, cat] }));
                                            } else {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    categories: prev.categories.filter(c => c !== cat)
                                                }));
                                            }
                                        }}
                                        className={modalStyle.checkboxInput}
                                    />
                                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </label>
                            ))}
                            {errors.categories && <p className={modalStyle.error}>{errors.categories}</p>}
                        </fieldset>

                        {/* Fit */}
                        <fieldset className={modalStyle.fieldset}>
                            <legend className={modalStyle.legend}>Es fit?:</legend>
                            <label className={modalStyle.radioLabel}>
                                <input
                                    type="radio"
                                    name="fit"
                                    value="Sí"
                                    checked={formData.fit === true}
                                    onChange={() => handleInputChange('fit', true)}
                                    className={modalStyle.radioInput}
                                />
                                Sí
                            </label>
                            <label className={modalStyle.radioLabel}>
                                <input
                                    type="radio"
                                    name="fit"
                                    value="No"
                                    checked={formData.fit === false}
                                    onChange={() => handleInputChange('fit', false)}
                                    className={modalStyle.radioInput}
                                />
                                No
                            </label>
                        </fieldset>

                        {/* Ingredients */}
                        <section className={modalStyle.inputSection}>
                            <label htmlFor="ingredients" className={modalStyle.label}>Ingredientes:</label>
                            <textarea
                                placeholder="Ingredientes"
                                value={formData.ingredients}
                                onChange={(e) => handleInputChange('ingredients', e.target.value)}
                                className={modalStyle.textarea}
                            />
                            {errors.ingredients && <p className={modalStyle.error}>{errors.ingredients}</p>}
                        </section>

                        {/* Instructions */}
                        <section className={modalStyle.inputSection}>
                            <label htmlFor="instructions" className={modalStyle.label}>Instrucciones:</label>
                            <textarea
                                placeholder="Instrucciones"
                                value={formData.instructions}
                                onChange={(e) => handleInputChange('instructions', e.target.value)}
                                className={modalStyle.textarea}
                            />
                            {errors.instructions && <p className={modalStyle.error}>{errors.instructions}</p>}
                        </section>
                    </div>

                    <div className={modalStyle.buttonContainer}>
                        <button
                            onClick={handleUpdateRecipe}
                            disabled={saving}
                            className={modalStyle.recipeModalButton}
                        >
                            {saving
                                ? (formMode === 'edit' ? 'Guardando...' : 'Registrando...')
                                : (formMode === 'edit' ? 'Guardar cambios' : 'Registrar receta')}
                        </button>
                    </div>
                </>
            </RecipeModal>

        </main>
    );
}
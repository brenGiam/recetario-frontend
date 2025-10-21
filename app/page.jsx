'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecipes, createRecipe } from '@/app/services/recipeService';
import Image from 'next/image';
import RecipeModal from '@/app/components/RecipeModal';
import RecipeCard from '@/app/components/RecipeCard';
import modalStyle from '@/app/styles/recipeModal.module.css';
import style from '@/app/styles/home.module.css';

export default function Home() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    fit: true,
    ingredients: [],
    instructions: '',
    image: null
  })
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({})

  const loadRecipes = async (pageNumber = 0) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes(null, null, pageNumber, 6);
      setRecipes(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error al obtener Recetas:', error);
      setRecipes([]);
      setError('No se pudieron cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes(page);
  }, [page]);

  const handleAddRecipeModal = () => {
    setFormData({
      title: '',
      category: 'DESAYUNO',
      fit: true,
      ingredients: [],
      instructions: '',
      image: null
    });

    setErrors({});
    setModalOpen(true);
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

  const validateFields = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.ingredients.trim()) newErrors.ingredients = 'Los ingredientes son obligatorios';
    if (!formData.instructions.trim()) newErrors.instructions = 'Las instrucciones son obligatorias';
    return newErrors;
  };

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (saving) return;

    const errorsDetected = validateFields();
    if (Object.keys(errorsDetected).length > 0) {
      setErrors(errorsDetected);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        ingredients: formData.ingredients.split(',').map(i => i.trim())
      };

      await createRecipe(payload);
      setModalOpen(false);
      await loadRecipes(0);
      setPage(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cleanFilters = () => {
    setCategory(null);
    setFit(null);
    setPage(0);
    clearSelection();
    router.push('/');
  };

  if (loading) return <div className={style.loading}>Cargando Recetas...</div>;
  if (error) return <div className={style.error}>Error: {error}</div>;

  return (
    <main className={style.mainContainer}>
      <h1 className={style.homeTitle}>Todas las recetas</h1>
      <div className={style.recipeButtonContainer}>
        <button className={style.recipeButton} onClick={handleAddRecipeModal}>
          + Nueva Receta
        </button>
      </div>
      <div className={style.recipesContainer}>
        {recipes.length === 0 ? (
          <p className={style.noRecipesMessage}>
            {Object.values(activeFilters).some(f => f !== null)
              ? 'No se encontraron recetas con esos filtros'
              : 'No hay recetas registradas'}
          </p>
        ) : (
          recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={style.paginationContainer}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className={style.paginationButton}
            >
              Anterior
            </button>
            <span className={style.paginationInfo}>
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className={style.paginationButton}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
      <RecipeModal
        modalOpen={modalOpen}
        modalClose={() => setModalOpen(false)}
      >
        <>
          <header className={modalStyle.modalHeader}>
            <h3>Agregar receta</h3>
          </header>

          <div className={modalStyle.imageInputContainer}>
            {formData.image && (
              <Image
                src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)}
                width={200}
                height={200}
                alt={formData.title || 'Imagen de la receta'}
                className={modalStyle.imagePreview} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={modalStyle.imageInput} />
          </div>

          {/* Title */}
          <section className={modalStyle.inputSection}>
            <label htmlFor="title" className={modalStyle.label}>Titulo:</label>
            <input
              type="text"
              placeholder="Titulo"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={modalStyle.input} />
            {errors.title && <p className={modalStyle.error}>{errors.title}</p>}
          </section>

          <div className={modalStyle.formContainer}>
            {/* Category */}
            <fieldset className={modalStyle.fieldset}>
              <legend className={modalStyle.legend}>Categoría:</legend>
              {['DESAYUNO', 'BRUNCH', 'ALMUERZO', 'MERIENDA', 'CENA'].map(cat => (
                <label key={cat} className={modalStyle.radioLabel}>
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={formData.category === cat}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={modalStyle.radioInput} />
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </label>
              ))}
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
                  className={modalStyle.radioInput} />
                Sí
              </label>
              <label className={modalStyle.radioLabel}>
                <input
                  type="radio"
                  name="fit"
                  value="No"
                  checked={formData.fit === false}
                  onChange={() => handleInputChange('fit', false)}
                  className={modalStyle.radioInput} />
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
                className={modalStyle.textarea} />
              {errors.ingredients && <p className={modalStyle.error}>{errors.ingredients}</p>}
            </section>

            {/* Instructions */}
            <section className={modalStyle.inputSection}>
              <label htmlFor="instructions" className={modalStyle.label}>Instrucciones:</label>
              <textarea
                placeholder="Instrucciones"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                className={modalStyle.textarea} />
              {errors.instructions && <p className={modalStyle.error}>{errors.instructions}</p>}
            </section>
          </div>

          <div className={modalStyle.buttonContainer}>
            <button
              onClick={handleCreateRecipe}
              disabled={saving}
              className={modalStyle.recipeModalButton}
            >
              {saving ? 'Guardando...' : 'Guardar receta'}
            </button>
          </div>
        </>
      </RecipeModal>
    </main>
  );
}

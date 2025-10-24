'use client'

import { useState, useEffect } from 'react';
import { getRecipes, createRecipe } from '@/app/services/recipeService';
import Image from 'next/image';
import RecipeModal from '@/app/components/RecipeModal';
import RecipeCard from '@/app/components/RecipeCard';
import Aside from '@/app/components/Aside.jsx';
import modalStyle from '@/app/styles/recipeModal.module.css';
import style from '@/app/styles/home.module.css';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({ category: '', fit: '', search: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    categories: [],
    fit: true,
    ingredients: [],
    instructions: '',
    image: null
  })
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({})


  const validateFields = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.ingredients.trim()) newErrors.ingredients = 'Los ingredientes son obligatorios';
    if (!formData.instructions.trim()) newErrors.instructions = 'Las instrucciones son obligatorias';
    if (formData.categories.length === 0) newErrors.categories = 'Seleccioná al menos una categoría';
    return newErrors;
  };

  const loadRecipes = async (pageNumber = 0, activeFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const { category, fit, search } = activeFilters;

      const data = await getRecipes(
        category ? [category] : [],
        fit !== '' ? fit : null,
        search,
        pageNumber,
        6
      );

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
      if (err.message.includes('20MB') || err.message.toLowerCase().includes('archivo')) {
        setErrors(prev => ({ ...prev, image: err.message }));
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    const categoryChanged = newFilters.category !== filters.category;
    const fitChanged = newFilters.fit !== filters.fit;

    if (categoryChanged || fitChanged) {
      setPage(0);
      loadRecipes(0, newFilters);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadRecipes(0, filters);
  };

  const handleAddRecipeModal = () => {
    setFormData({
      title: '',
      categories: [],
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

    if (!file) return;

    setErrors(prev => ({ ...prev, image: '' }));

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Formato de imagen no válido. Permitidos: JPG, PNG o WEBP.' }));
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, image: 'El archivo supera el tamaño máximo permitido (20MB).' }));
      return;
    }

    if (formData.image && typeof formData.image !== 'string') {
      URL.revokeObjectURL(formData.image);
    }

    setFormData(prev => ({ ...prev, image: file }));
  }

  useEffect(() => {
    loadRecipes(page, filters);
  }, [page]);

  if (loading) return <div className={style.loading}>Cargando Recetas...</div>;
  if (error) return <div className={style.error}>Error: {error}</div>;

  return (
    <main className={style.mainWrapper}>
      <Aside
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />
      <div className={style.mainContainer}>
        <h1 className={style.homeTitle}>Todas las recetas</h1>

        <div className={style.recipeButtonContainer}>
          <button className={style.recipeButton} onClick={handleAddRecipeModal}>
            + Nueva Receta
          </button>
        </div>
        <div className={style.recipesContainer}>
          {loading ? (
            <div className={style.loading}>Cargando Recetas...</div>
          ) : error ? (
            <div className={style.error}>Error: {error}</div>
          ) : recipes.length === 0 ? (
            <p className={style.noRecipesMessage}>
              No se encontraron recetas {filters.category || filters.fit || filters.search ? 'con esos filtros' : ''}
            </p>
          ) : (
            recipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          )}
          {/* Paginación */}
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
      </div>
      <div>
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
                className={modalStyle.imageInput}
              />
              {errors.image && <p className={modalStyle.error}>{errors.image}</p>}
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
      </div>
    </main>
  );
}

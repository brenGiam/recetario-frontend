'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRecipes } from '@/app/services/recipeService';
import Image from 'next/image';
import RecipeModal from '@/app/components/RecipeModal';
import RecipeCard from '@/app/components/RecipeCard';
// import modalStyle from '@/app/estilos/modalMascota.module.css';
import style from '@/app/styles/home.module.css';

export default function Home() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    category: null,
    fit: null,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const loadRecipes = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRecipes(filters);
      setRecipes(data.content || []);
    } catch (error) {
      console.error('Error al obtener Recetas:', error);
      setRecipes([]);
      setError('No se pudieron cargar las recetas');
    } finally {
      setLoading(false);
    }
  };

  const openNewRecipeModal = async () => {
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const cleanFilters = () => {
    setActiveFilters({
      category: null,
      fit: null,
    });
    clearSelection();
    router.push('/galeria');
  };

  useEffect(() => {
    loadRecipes(activeFilters);
  }, [activeFilters]);

  if (loading) return (
    <div className={style.loading}>
      Cargando Recetas...
    </div>
  );

  if (error) return (
    <div className={style.error}>
      Error: {error}
    </div>
  );

  return (
    <main className={style.mainContainer}>
      <h1 className={style.homeTitle}>Todas las recetas</h1>
      <div className={style.recipeButtonContainer}>
        <button className={style.recipeButton} onClick={openNewRecipeModal}>
          + Nueva Receta
        </button>
      </div>
      <div className={style.recipesContainer}>
        {recipes.length === 0 ? (
          <p className={style.noRecipesMessage}>
            {Object.values(activeFilters).some(f => f !== null)
              ? 'No se encontraron recetas con esos filtros'
              : 'No hay recetas registradas'
            }
          </p>
        ) : (
          recipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        )}
      </div>
    </main>
  );
}

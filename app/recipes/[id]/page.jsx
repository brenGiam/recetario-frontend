'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getRecipe } from '@/app/services/recipeService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUtensils, faLeaf, faShare } from '@fortawesome/free-solid-svg-icons';
import style from '@/app/styles/recipeDetail.module.css';

export default function RecipeDetail() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleEditModal = () => {
        // Logic to open edit modal
    };

    const handleDelete = () => {
        // Logic to delete recipe
    };
    const handleShare = () => {
        // Logic to share recipe
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
        <div className={style.recipeDetailContainer}>
            <h1 className={style.recipeTitle}>{recipe.title}</h1>
            <div className={style.recipeMeta}>
                <p><FontAwesomeIcon icon={faUtensils} /> {recipe.category}</p>
                <p><FontAwesomeIcon icon={faLeaf} /> Fit: {recipe.fit ? 'Sí' : 'No'}</p>
            </div>
            <div className={style.recipeContentContainer}>
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
                <button className={style.recipeDetailButton} onClick={handleDelete}>
                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                </button>
                <button className={style.recipeDetailButton} onClick={handleShare}>
                    <FontAwesomeIcon icon={faShare} /> Compartir
                </button>
            </div>
        </div>
    );
}
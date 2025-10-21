import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import style from '@/app/styles/recipeCard.module.css';

export default function recipeCard({ recipe }) {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/recipes/${recipe.id}`);
    };

    return (
        <div
            className={style.cardRecipe}
            onClick={handleViewDetails}
        >
            <div className={style.cardImageContainer}>
                {recipe.imageUrl ? (
                    <Image
                        src={recipe.imageUrl}
                        alt="Foto receta"
                        width={280}
                        height={280}
                        className={style.cardImage}
                    />
                ) : (
                    <div className={style.noImage}>
                        <span>📷</span>
                    </div>
                )}
            </div>

            <div className={style.cardContent}>
                <h3 className={style.cardTitle}>
                    {recipe.title}
                </h3>
                <h4 className={style.cardCategory}>
                    {recipe.category}
                </h4>
                <h4 className={style.cardFit}>
                    {recipe.fit ? 'Fit' : 'No fit'}
                </h4>

                <button className={style.cardButton} onClick={handleViewDetails}>
                    <FontAwesomeIcon icon={faEye} /> Ver Detalles
                </button>
            </div>
        </div>
    );
};
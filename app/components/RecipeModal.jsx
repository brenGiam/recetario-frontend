import modalStyle from '@/app/styles/recipeModal.module.css';

export default function RecipeModal({ modalOpen, modalClose, children }) {

    if (!modalOpen) return null; // Si el modal no está abierto, no renderiza nada

    return (
        <main className={modalStyle.mainContainer}>
            <div className={modalStyle.innerContainer}>
                <button
                    className={modalStyle.closeButton}
                    onClick={modalClose}
                >
                    ✕
                </button>
                {children}
            </div>
        </main>
    );
}
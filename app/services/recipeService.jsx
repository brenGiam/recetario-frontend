const BASE_URL = 'http://localhost:8080'

export const getRecipes = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.category) params.append('category', filters.category);
        if (filters.fit) params.append('fit', filters.fit);

        params.append('page', filters.page || 0);
        params.append('size', filters.size || 20);

        const queryString = params.toString();
        const url = `${BASE_URL}/recipes/filter${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener recetas:', error);
        throw error;
    }
};

export const getRecipe = async (recipeId) => {
    try {
        const url = `${BASE_URL}/recipes/${recipeId}`;

        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Error ${response.status}: ${errorData || response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al obtener receta:', error);
        throw error;
    }
};

export const createRecipe = async (recipeData) => {
    try {
        const body = new FormData();

        const recipe = {
            title: recipeData.title,
            category: recipeData.category,
            fit: recipeData.fit,
            ingredients: recipeData.ingredients,
            instructions: recipeData.instructions,
        };

        body.append('recipe', JSON.stringify(recipe));

        if (recipeData.image && recipeData.image instanceof File) {
            body.append('image', recipeData.image);
        }

        const res = await fetch(`${BASE_URL}/recipes`, {
            method: 'POST',
            body
        });

        if (!res.ok) {
            let errorMessage = 'Error al crear receta';
            let responseText = '';

            try {
                responseText = await res.text();
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                switch (res.status) {
                    case 400:
                        errorMessage = 'Datos inválidos o incompletos';
                        break;
                    case 500:
                        errorMessage = `Error interno del servidor. Response: ${responseText}`;
                        break;
                    default:
                        errorMessage = `Error ${res.status}: ${res.statusText}. Response: ${responseText}`;
                }
            }

            throw new Error(errorMessage);
        }

        const result = await res.json();
        return result;

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Error de conexión. Verifique su conexión a internet.');
        }
        throw error;
    }
};

export const updateRecipe = async (recipeData, recipeId) => {
    try {
        const body = new FormData();

        const recipe = {
            id: recipeId,
            title: recipeData.title,
            category: recipeData.category,
            fit: recipeData.fit,
            ingredients: recipeData.ingredients,
            instructions: recipeData.instructions,
        };

        body.append('recipe', JSON.stringify(recipe));

        if (recipeData.image instanceof File) {
            body.append('image', recipeData.image);
        }

        const res = await fetch(`${BASE_URL}/recipes`, {
            method: 'PATCH',
            body,
        });

        if (!res.ok) {
            let errorMessage = 'Error al actualizar receta';
            let responseText = '';

            try {
                responseText = await res.text();
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                switch (res.status) {
                    case 400:
                        errorMessage = 'Datos inválidos o incompletos';
                        break;
                    case 404:
                        errorMessage = 'Receta no encontrada.';
                        break;
                    case 500:
                        errorMessage = `Error interno del servidor. Response: ${responseText}`;
                        break;
                    default:
                        errorMessage = `Error ${res.status}: ${res.statusText}. Response: ${responseText}`;
                }
            }

            throw new Error(errorMessage);
        }

        const result = await res.json();
        return result;

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Error de conexión. Verifique su conexión a internet.');
        }
        throw error;
    }
};

export const deleteRecipe = async (recipeId) => {
    try {
        const response = await fetch(`${BASE_URL}/recipes/${recipeId}`, {
            method: 'DELETE',
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMessage =
                data?.message ||
                data?.error ||
                (response.status === 404
                    ? 'Receta no encontrada'
                    : response.status === 500
                        ? 'Error interno del servidor'
                        : `Error ${response.status}: ${response.statusText}`);

            throw new Error(errorMessage);
        }

        return data?.message || 'Receta eliminada exitosamente';

    } catch (error) {
        console.error('Error al eliminar receta:', error);
        throw error;
    }
};
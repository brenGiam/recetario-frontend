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
            method: 'GET',
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
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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

export const registrarMascota = async (mascotaData, token) => {
    try {
        const body = new FormData();

        const mascota = {
            especie: mascotaData.especie,
            estado: mascotaData.estado,
            nombre: mascotaData.nombre,
            conCollar: mascotaData.conCollar,
            raza: mascotaData.raza,
            colores: mascotaData.colores,
            caracteristicas: mascotaData.caracteristicas,
            sexo: mascotaData.sexo,
            provincia: mascotaData.provincia.trim(),
            ciudad: mascotaData.ciudad.trim(),
            barrio: mascotaData.barrio
        };

        console.log('Datos a enviar:', mascota);

        body.append('mascota', JSON.stringify(mascota));

        if (mascotaData.foto && mascotaData.foto instanceof File) {
            console.log('Agregando imagen:', mascotaData.foto.name, mascotaData.foto.size);
            body.append('imagen', mascotaData.foto);
        }

        const res = await fetch(`${BASE_URL}/mascotas`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        });

        console.log('Status de respuesta:', res.status);

        if (!res.ok) {
            let errorMessage = 'Error al registrar mascota';
            let responseText = '';

            try {
                responseText = await res.text();
                console.log('Respuesta del servidor:', responseText);
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                console.log('Error al parsear respuesta:', parseError);
                switch (res.status) {
                    case 400:
                        errorMessage = 'Datos inválidos o incompletos - Revisar logs';
                        break;
                    case 401:
                        errorMessage = 'No autorizado. Inicie sesión nuevamente';
                        break;
                    case 403:
                        errorMessage = 'No tiene permisos para realizar esta acción';
                        break;
                    case 404:
                        errorMessage = 'Usuario no encontrado';
                        break;
                    case 422:
                        errorMessage = 'Los datos proporcionados no son válidos';
                        break;
                    case 500:
                        errorMessage = `Error interno del servidor. Response: ${responseText}`;
                        break;
                    default:
                        errorMessage = `Error ${res.status}: ${res.statusText}. Response: ${responseText}`;
                }
            }
            const error = new Error(errorMessage);
            error.status = res.status;
            throw error;
        }

        const result = await res.json();
        console.log('Mascota registrada exitosamente:', result);
        return result;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Error de conexión. Verifique su conexión a internet');
        }
        throw error;
    }
};

export const actualizarMascota = async (datosMascota, token, idMascota) => {
    try {
        const body = new FormData();

        const mascota = {
            id: idMascota,
            nombre: datosMascota.nombre,
            especie: datosMascota.especie,
            estado: datosMascota.estado,
            raza: datosMascota.raza,
            conCollar: datosMascota.conCollar,
            colores: datosMascota.colores,
            caracteristicas: datosMascota.caracteristicas,
            sexo: datosMascota.sexo,
            provincia: datosMascota.provincia,
            ciudad: datosMascota.ciudad,
            barrio: datosMascota.barrio || '',
            tel: datosMascota.tel,
        };

        body.append('mascota', JSON.stringify(mascota));

        if (datosMascota.foto instanceof File) {
            body.append('imagen', datosMascota.foto);
        } else {
            console.log('No hay imagen nueva');
        }

        const res = await fetch(`${BASE_URL}/mascotas`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        });

        if (!res.ok) {
            let errorMessage = 'Error al actualizar mascota';
            let responseText = '';

            try {
                responseText = await res.text();
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                switch (res.status) {
                    case 400:
                        errorMessage = 'Datos inválidos o incompletos - Revisar logs';
                        break;
                    case 401:
                        errorMessage = 'No autorizado. Inicie sesión nuevamente';
                        break;
                    case 403:
                        errorMessage = 'No tiene permisos para realizar esta acción';
                        break;
                    case 404:
                        errorMessage = 'Mascota no encontrada';
                        break;
                    case 422:
                        errorMessage = 'Los datos proporcionados no son válidos';
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
            throw new Error('Error de conexión. Verifique su conexión a internet');
        }
        throw error;
    }
};

export const eliminarMascota = async (token, idMascota) => {
    try {
        const respuesta = await fetch(`${BASE_URL}/mascotas/${idMascota}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            let errorMessage = 'Error al eliminar mascota';

            try {
                const errorData = await respuesta.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                switch (respuesta.status) {
                    case 401:
                        errorMessage = 'No autorizado';
                        break;
                    case 403:
                        errorMessage = 'No tiene permisos para eliminar esta mascota';
                        break;
                    case 404:
                        errorMessage = 'Mascota no encontrada';
                        break;
                    default:
                        errorMessage = `Error ${respuesta.status}: ${respuesta.statusText}`;
                }
            }

            throw new Error(errorMessage);
        }

        return true;

    } catch (error) {
        console.error('Error al eliminar mascota:', error);
        throw error;
    }
};
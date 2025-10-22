'use client'

import style from '@/app/styles/aside.module.css';

export default function Aside({ filters, onFilterChange, onSearch }) {
    const { category, fit, search } = filters;

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        onFilterChange({
            ...filters,
            category: newCategory,
        });
    };

    const handleFitChange = (e) => {
        const value = e.target.value;
        onFilterChange({
            ...filters,
            fit: value === '' ? '' : value === 'true',
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        onFilterChange({
            ...filters,
            search: value,
        });
    };

    const handleSearchClick = () => {
        if (onSearch) onSearch();
    };

    return (
        <aside className={style.aside}>
            <h3>Filtrar recetas</h3>

            {/* Category */}
            <div className={style.filterGroup}>
                <label>Categoría</label>
                <select value={category} onChange={handleCategoryChange}>
                    <option value="">Todas</option>
                    <option value="DESAYUNO">Desayuno</option>
                    <option value="BRUNCH">Brunch</option>
                    <option value="ALMUERZO">Almuerzo</option>
                    <option value="CENA">Cena</option>
                    <option value="MERIENDA">Merienda</option>
                    <option value="POSTRE">Postre</option>
                </select>
            </div>

            {/* Fit */}
            <div className={style.filterGroup}>
                <label>Tipo</label>
                <select value={fit === '' ? '' : fit ? 'true' : 'false'} onChange={handleFitChange}>
                    <option value="">Todos</option>
                    <option value="true">Fit</option>
                    <option value="false">No Fit</option>
                </select>
            </div>

            {/* Search */}
            <div className={style.filterGroup}>
                <label>Búsqueda</label>
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Por ingredientes o título"
                />
                <button
                    type="button"
                    className={style.searchButton}
                    onClick={handleSearchClick}
                >
                    Buscar
                </button>
            </div>
        </aside>
    );
}


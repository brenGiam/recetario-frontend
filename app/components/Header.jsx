import styles from '@/app/styles/header.module.css';

export default function Header() {
    return (
        <div className={styles.headerContainer}>
            <h1 className={styles.headerTitle}>Mi recetario</h1>
        </div>
    );
}
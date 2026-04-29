// app/not-found.tsx
"use client"

import { useRouter } from 'next/navigation'
import styles from './not-found.module.css'

export default function NotFound() {
  const router = useRouter()

  const goHome = () => {
    router.push('/')
  }

  const goBack = () => {
    router.back()
  }

  return (
    <div className={styles.notfound}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Страница не найдена</h1>
        <p className={styles.subtitle}>
          Похоже, вы попали не туда. Запрашиваемая страница не существует
          или была перемещена.
        </p>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={goHome}
          >
            На главную
          </button>
          <button
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={goBack}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}
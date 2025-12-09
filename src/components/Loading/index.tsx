import React from 'react'
import { clsx } from 'clsx'
import styles from './Loading.module.css'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullscreen?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullscreen = false,
}) => {
  const content = (
    <div className={styles.loadingContent}>
      <div className={clsx(styles.spinner, styles[size])}></div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  )

  if (fullscreen) {
    return <div className={styles.fullscreen}>{content}</div>
  }

  return content
}

import React from 'react'
import { clsx } from 'clsx'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <div className={clsx(styles.inputWrapper, fullWidth && styles.fullWidth)}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        <input
          className={clsx(
            styles.input,
            error && styles.error,
            icon && styles.hasIcon,
            className
          )}
          {...props}
        />
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  )
}

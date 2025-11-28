import React from 'react';
import styles from '../Style/Skeleton.module.css';

export default function Skeleton({ type = 'text', width, height, className }) {
  const style = {
    width: width,
    height: height,
  };

  // Combine base class with type class
  const classes = `${styles.skeleton} ${styles[type]} ${className || ''}`;

  return <div className={classes} style={style}></div>;
}
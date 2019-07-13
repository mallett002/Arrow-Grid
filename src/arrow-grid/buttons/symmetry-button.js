import React from 'react';
import {SymmetryIcon} from './icons';
export const SymmetryButton = ({onClick, isActive, className}) => (
    <button className={"EditButton isEnabled" + (isActive ? " ActiveControl":"")} onClick={onClick}>
        <SymmetryIcon className={className}></SymmetryIcon>
    </button>
)
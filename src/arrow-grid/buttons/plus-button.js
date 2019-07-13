import React from 'react';
import {PlusIcon} from './icons';
export const PlusButton = ({onClick}) => (
    <button className={"PlusButton isEnabled"} onClick={onClick}>
        <PlusIcon></PlusIcon>
    </button>
)
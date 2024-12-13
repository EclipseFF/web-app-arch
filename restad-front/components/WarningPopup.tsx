'use client';
import React, { useState } from 'react';

interface WarningPopupProps {
    onConfirm: () => void;
    message: string;
}

export default function WarningPopup({ onConfirm, message }: WarningPopupProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Notice</h2>
                <p className="mb-4 text-gray-700">{message}</p>
                <button
                    onClick={onConfirm}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                    Я согласен, продолжить
                </button>
            </div>
        </div>
    );
}
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
     <div className="min-h-[90vh] flex items-center justify-center p-6 text-gray-200 font-sans">
      <div className="w-full max-w-[520px] text-center px-6 py-10 bg-gray-900 border border-gray-800 rounded-[20px]">
        <div className="text-[120px] font-extrabold leading-none text-[#6a93c8] mb-2.5">
          404
        </div>
        <h1 className="text-[28px] mt-2 mb-2.5">Страница не найдена</h1>
        <p className="text-gray-400 text-[15px] leading-relaxed mb-7">
          Похоже, вы попали не туда. Запрашиваемая страница не существует или
          была перемещена.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            className="px-[18px] py-2.5 rounded-xl text-sm cursor-pointer border-none transition-all duration-200 bg-[#6a93c8] text-[#0e1014] hover:bg-[#82a6d4]"
            onClick={() => router.push("/")}
          >
            На главную
          </button>
          <button
            className="px-[18px] py-2.5 rounded-xl text-sm cursor-pointer bg-transparent text-[#6a93c8] border border-[#6a93c8] transition-all duration-200 hover:bg-[#6a93c8]/10"
            onClick={() => router.back()}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}
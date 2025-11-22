import styles from "@/styles/Loader.module.css"

export default function Cargando() {
  return (
    <div className="flex h-screen w-full justify-center items-center bg-white">
      <div className="flex flex-col items-center">
        <div className={`${styles["loader-circle"]} relative w-48 h-48 mb-9`}>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
          <div className={`${styles.dot} absolute bg-indigo-500 w-12 h-12 rounded-full`}></div>
        </div>
        <div className="text-4xl font-bold text-gray-700 mt-5">Cargando</div>
      </div>
    </div>
  )
}


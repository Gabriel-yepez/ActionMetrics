import Image from 'next/image'

export default function LogoInicio() {
  return (
    <div>
       <Image
            className='mb-28 rounded-full'
            src="/fotoPerfil3.webp"
            width={320}
            height={400}
            alt="Foto de perfil"
            priority={true}
        />
    </div>
  )
}

import {Link} from "react-router-dom";

export default function Card({
  title = "titulo no definido",
  description = "descripción no definida",
  href = "#"
}) {
  return (
    <Link
      to={href}
      className="
        group
        relative
        inline-block
        w-full
        h-35
        max-w-md
        max-h-30
        overflow-hidden
        m-4
        rounded
        bg-[#f2f8f9]
        px-6
        py-5
        no-underline
      "
    >
      {/* Círculo animado */}
      <span
        className="
          absolute
          -right-4
          -top-4
          h-8
          w-10
          rounded-full
         bg-[#8d6700]
          transition-transform
          duration-300
          ease-out
          group-hover:scale-[25]
          z-0
        "
      />

      {/* Contenido */}
      <div className="relative z-10 ">
        <p
          className="
            text-[20px]
            font-semibold
            leading-5
            text-[#666]
            transition-colors
            duration-300
            group-hover:text-white
          "
        >
          {title}
        </p>

        <p
          className="
            mt-2
            text-[18px]
            text-[#666]
            transition-colors
            duration-300
            group-hover:text-white/80
          "
        >
          {description}
        </p>
      </div>

      {/* Esquina */}
      <div
        className="
          absolute
          right-0
          top-0
          flex
          h-8
          w-9
          items-center
          justify-center
          overflow-hidden
          rounded-bl-[32px]
          bg-[#8d6700]
          z-20
        "
      >
        <span className="-mr-1 -mt-1 text-white">→</span>
      </div>
    </Link>
  );
}
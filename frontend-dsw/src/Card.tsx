export default function Card({
  title = "This is heading",
  description = "Card description with lots of great facts and interesting details.",
  href = "#",
}) {
  return (
    <a
      href={href}
      className="
        group
        relative
        block
        max-w-[262px]
        max-h-[120px]
        overflow-hidden
        mg-4
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
          w-8
          rounded-full
          bg-[#00838d]
          transition-transform
          duration-300
          ease-out
          group-hover:scale-[21]
          z-0
        "
      />

      {/* Contenido */}
      <div className="relative z-10 ">
        <p
          className="
            text-[18px]
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
            text-sm
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
          w-8
          items-center
          justify-center
          overflow-hidden
          rounded-bl-[32px]
          bg-[#00838d]
          z-20
        "
      >
        <span className="-mr-1 -mt-1 text-white">→</span>
      </div>
    </a>
  );
}
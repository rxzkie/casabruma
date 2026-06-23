import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  light?: boolean;
  href?: string;
  className?: string;
};

const sizes = {
  sm: { img: 36, box: "h-9 w-9", text: "text-lg" },
  md: { img: 44, box: "h-11 w-11 sm:h-12 sm:w-12", text: "text-xl sm:text-2xl" },
  lg: { img: 64, box: "h-16 w-16", text: "text-2xl" },
};

export default function Logo({
  size = "md",
  showText = true,
  light = false,
  href = "/",
  className = "",
}: LogoProps) {
  const s = sizes[size];

  const content = (
    <>
      <Image
        src="/logo.png"
        alt="Casa Bruma"
        width={s.img}
        height={s.img}
        className={`${s.box} shrink-0 rounded-full object-cover`}
        priority={size === "md"}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display ${s.text} tracking-[0.12em] ${light ? "text-bruma-cream" : "text-bruma-deep"} sm:tracking-[0.15em]`}
          >
            CASA
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-bruma-mist sm:text-[10px] sm:tracking-[0.35em]">
            Bruma
          </span>
        </div>
      )}
    </>
  );

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 ${className}`}
    >
      {content}
    </Link>
  );
}

interface TypographyProps {
  font?: "default" | "karla" | "nunito"
  className?: string
  weight?: "bold" | "regular" | "light"
  size?: string
  children?: React.ReactNode
  [props: string]: any
}

export type { TypographyProps }

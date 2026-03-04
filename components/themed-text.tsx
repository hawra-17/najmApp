import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  className?: string;
};

export function ThemedText({ className, ...rest }: ThemedTextProps) {
  // Default to najm-blue color if no text color class is provided
  const hasColorClass =
    className &&
    /\btext-(white|black|gray|red|green|blue|najm|neutral|slate|zinc|amber|emerald|rose|orange|yellow|purple|pink|indigo|teal|cyan|sky|violet|fuchsia|lime|stone|transparent|current|\[#)/.test(
      className,
    );

  const finalClassName = hasColorClass
    ? className
    : `text-[#1f72ea] ${className || ""}`;

  return <Text className={finalClassName.trim()} {...rest} />;
}

import * as LucideIcons from "lucide-react-native";
import { HelpCircle } from "lucide-react-native";
import React from "react";
import { cssInterop } from "react-native-css-interop";

function toPascalCase(str) {
  return str
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}
function Icon({ name, size = 24, color = "#000", strokeWidth = 2, ...props }) {
  const iconName = toPascalCase(name);
  const IconComponent = LucideIcons[iconName];

  if (!IconComponent) {
    return (
      <HelpCircle
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

cssInterop(Icon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      size: true,
      width: "size",
      height: "size",
    },
  },
});

export default Icon;
